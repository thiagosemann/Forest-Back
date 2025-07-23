const limpezaExtraModel = require('../../models/Airbnb/limpezaExtraAirbnbModel');
const usersModel = require('../../models/Airbnb/usersAirbnbModel');
const reservaModel = require('../../models/Airbnb/reservasAirbnbModel');
const whatsControle = require('../../WhatsApp/whats_Controle');

const getAllLimpezasExtras = async (request, response) => {
  try {
    const limpezas = await limpezaExtraModel.getAllLimpezasExtras();
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras' });
  }
};

const getLimpezaExtraById = async (request, response) => {
  try {
    const { id } = request.params;
    const limpeza = await limpezaExtraModel.getLimpezaExtraById(id);

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
    const limpeza = { ...request.body, id };

    const wasUpdated = await limpezaExtraModel.updateLimpezaExtra(limpeza);

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
    const limpezas = await limpezaExtraModel.getLimpezasExtrasHoje();
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras de hoje:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras de hoje' });
  }
};

const getLimpezasExtrasSemana = async (request, response) => {
  try {
    const limpezas = await limpezaExtraModel.getLimpezasExtrasSemana();
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras desta semana:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras desta semana' });
  }
};

const getLimpezasExtrasSemanaQueVem = async (request, response) => {
  try {
    const limpezas = await limpezaExtraModel.getLimpezasExtrasSemanaQueVem();
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras da semana que vem:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras da semana que vem' });
  }
};
 
const getLimpezasExtrasPorPeriodo = async (request, response) => {
  try {
    const { startDate, endDate } = request.query;
    if (!startDate || !endDate) {
      return response.status(400).json({ error: 'Informe startDate e endDate no formato YYYY-MM-DD' });
    }

    const limpezas = await limpezaExtraModel.getLimpezasExtrasPorPeriodo(startDate, endDate);
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