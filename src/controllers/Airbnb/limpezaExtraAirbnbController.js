const limpezaExtraModel = require('../../models/Airbnb/limpezaExtraAirbnbModel');
const usersModel = require('../../models/Airbnb/usersAirbnbModel');
const reservaModel = require('../../models/Airbnb/reservasAirbnbModel');
const whatsControle = require('../../WhatsApp/whats_Controle');
const alocacaoModel = require('../../models/Airbnb/limpezaAlocacaoModel');
const alocacaoController = require('./limpezaAlocacaoController');

const getAllLimpezasExtras = async (request, response) => {
  try {
    const { empresaId } = request;
    const limpezas = await limpezaExtraModel.getAllLimpezasExtras(empresaId);
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras' });
  }
};

const getLimpezaExtraById = async (request, response) => {
  try {
    const { id } = request.params;
    const { empresaId } = request;
    const limpeza = await limpezaExtraModel.getLimpezaExtraById(id, empresaId);

    if (limpeza) {
      return response.status(200).json(limpeza);
    } else {
      return response.status(404).json({ message: 'Limpeza extra não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao obter limpeza extra:', error);
    return response.status(500).json({ error: 'Erro ao obter limpeza extra' });
  }
};

const createLimpezaExtra = async (request, response) => {
  try {
    const created = await limpezaExtraModel.createLimpezaExtra(request.body);

    // Limpeza já nasce com responsável: primeira linha da planilha de alocações
    if (request.body.faxina_userId) {
      await alocacaoModel.registrarAlocacao({
        tipo: alocacaoModel.TIPO_LIMPEZA_EXTRA,
        referencia_id: created.insertId,
        apartamento_id: request.body.apartamento_id,
        faxina_userId_novo: request.body.faxina_userId,
        user_id: request.userId,
        origem: 'MANUAL',
        motivo: (request.body.motivo_alteracao && String(request.body.motivo_alteracao).trim())
          || 'Responsável definido no cadastro da limpeza'
      });
    }

    // Enviar mensagem se faxina_userId estiver presente E end_data for hoje
    if (request.body.faxina_userId != null) {
      const hoje = new Date();
      const today = hoje.toISOString().split('T')[0];
      const endData = new Date(request.body.end_data).toISOString().split('T')[0];

      if (endData === today) {
        const user = await usersModel.getUser(request.body.faxina_userId);
        let diaDaSemana = new Date(request.body.end_data).toLocaleDateString('pt-BR', { weekday: 'long' });
        diaDaSemana = diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1);
        let reservasHoje = await reservaModel.getReservasPorPeriodoByApartamentoID(request.body.apartamento_id, today, today);
        let entramHoje = reservasHoje.length > 0;
        // Buscar nome e senha do apartamento
        const apartamento_nome = (reservasHoje[0] && reservasHoje[0].apartamento_nome) || 'Apartamento';
        const apartamento_senha = (reservasHoje[0] && reservasHoje[0].apartamento_senha) || '';
        whatsControle.criarMensagemSelecionadaComoTerceirizadaLimpeza({
          apartamento_name: apartamento_nome,
          checkin: request.body.end_data,
          entramHoje: entramHoje,
          senha_porta: apartamento_senha,
          telefone: user.Telefone,
          diaDaSemana: diaDaSemana
        });
      }
    }

    return response.status(201).json(created);
  } catch (error) {
    console.error('Erro ao criar limpeza extra:', error);
    return response.status(409).json({ error: error.message });
  }
};

const updateLimpezaExtra = async (request, response) => {
  try {
    const { id } = request.params;
    const { motivo_alteracao, ...corpo } = request.body;
    const limpeza = { ...corpo, id };

    // Mesma regra da escala: limpeza de hoje ou anterior que já tem responsável
    // só troca com justificativa, e toda troca é registrada.
    const { erro, registrar } = await alocacaoController.prepararRegistroDeAlocacao({
      tipo: alocacaoController.TIPO_LIMPEZA_EXTRA,
      referencia_id: id,
      novoUserId: limpeza.faxina_userId,
      motivo: motivo_alteracao,
      userId: request.userId
    });
    if (erro) return response.status(erro.status).json({ error: erro.error });

    const wasUpdated = await limpezaExtraModel.updateLimpezaExtra(limpeza);
    if (wasUpdated && registrar) await registrar();

    // Enviar mensagem se faxina_userId estiver presente E end_data for hoje
    if (request.body.faxina_userId != null) {
      const hoje = new Date();
      const today = hoje.toISOString().split('T')[0];
      const endData = new Date(request.body.end_data).toISOString().split('T')[0];
      if (endData === today) {
        const user = await usersModel.getUser(request.body.faxina_userId);
        let diaDaSemana = new Date(request.body.end_data).toLocaleDateString('pt-BR', { weekday: 'long' });
        diaDaSemana = diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1);
        let reservasHoje = await reservaModel.getReservasPorPeriodoByApartamentoID(request.body.apartamento_id, today, today);
        let entramHoje = reservasHoje.length > 0;
        const apartamento_nome = (reservasHoje[0] && reservasHoje[0].apartamento_nome) || 'Apartamento';
        const apartamento_senha = (reservasHoje[0] && reservasHoje[0].apartamento_senha) || '';
        whatsControle.criarMensagemSelecionadaComoTerceirizadaLimpeza({
          apartamento_name: apartamento_nome,
          checkin: request.body.end_data,
          entramHoje: entramHoje,
          senha_porta: apartamento_senha,
          telefone: user.Telefone,
          diaDaSemana: diaDaSemana
        });
      }
    }

    if (wasUpdated) {
      return response.status(200).json({ message: 'Limpeza extra atualizada com sucesso' });
    } else {
      return response.status(404).json({ message: 'Limpeza extra não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar limpeza extra:', error);
    return response.status(500).json({ error: 'Erro ao atualizar limpeza extra' });
  }
};

const deleteLimpezaExtra = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await limpezaExtraModel.deleteLimpezaExtra(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Limpeza extra deletada com sucesso' });
    } else {
      return response.status(404).json({ message: 'Limpeza extra não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar limpeza extra:', error);
    return response.status(500).json({ error: 'Erro ao deletar limpeza extra' });
  }
};

const getLimpezasExtrasHoje = async (request, response) => {
  try {
    const { empresaId } = request;
    const limpezas = await limpezaExtraModel.getLimpezasExtrasHoje(empresaId);
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras de hoje:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras de hoje' });
  }
};

const getLimpezasExtrasSemana = async (request, response) => {
  try {
    const { empresaId } = request;
    const limpezas = await limpezaExtraModel.getLimpezasExtrasSemana(empresaId);
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras desta semana:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras desta semana' });
  }
};

const getLimpezasExtrasSemanaQueVem = async (request, response) => {
  try {
    const { empresaId } = request;
    const limpezas = await limpezaExtraModel.getLimpezasExtrasSemanaQueVem(empresaId);
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras da semana que vem:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras da semana que vem' });
  }
};
 
const getLimpezasExtrasPorPeriodo = async (request, response) => {
  try {
    const { startDate, endDate } = request.query;
    const { empresaId } = request;
    if (!startDate || !endDate) {
      return response.status(400).json({ error: 'Informe startDate e endDate no formato YYYY-MM-DD' });
    }

    const incluirInativos = request.query?.incluirInativos === 'true' || request.query?.incluirInativos === '1';
    const limpezas = await limpezaExtraModel.getLimpezasExtrasPorPeriodo(startDate, endDate, empresaId, incluirInativos);
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras por período:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras por período' });
  }
};

module.exports = {
  getAllLimpezasExtras,
  getLimpezaExtraById,
  createLimpezaExtra,
  updateLimpezaExtra,
  deleteLimpezaExtra,
  getLimpezasExtrasHoje,
  getLimpezasExtrasSemana,
  getLimpezasExtrasSemanaQueVem,
  getLimpezasExtrasPorPeriodo
};