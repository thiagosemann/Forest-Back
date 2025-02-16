const rateiosModel = require('../../models/Administracao/rateiosModel');
const rateiosPorApartamentoController = require('./rateiosPorApartamentoController');

const getAllRateios = async (request, response) => {
  try {
    const rateios = await rateiosModel.getAllRateios();
    return response.status(200).json(rateios);
  } catch (error) {
    console.error('Erro ao obter rateios:', error);
    return response.status(500).json({ error: 'Erro ao obter rateios' });
  }
};

const createRateio = async (request, response) => {
  try {
    // Criação do rateio principal
    const createdRateio = await rateiosModel.createRateio(request.body);

    // Para cada apartamento, criar o rateio por apartamento
    const { usersRateio } = request.body; // usersRateio é um array de apartamentos
    const rateioId = createdRateio.insertId; // ID do rateio criado

    for (const apartamento of usersRateio) {
      // Garantir que fracao_vagas seja 0 caso não exista
      const fracaoVagas = apartamento.fracao_vagas ? apartamento.fracao_vagas : 0;

      const rateioPorApartamento = {
        apartamento_id: apartamento.apartamento_id,
        rateio_id: rateioId,
        valor: apartamento.valorIndividual + apartamento.valorComum + apartamento.valorProvisoes + apartamento.valorFundos, // Total
        apt_name: apartamento.apt_name,
        apt_fracao: apartamento.apt_fracao,
        valorIndividual: apartamento.valorIndividual,
        valorComum: apartamento.valorComum,
        valorProvisoes: apartamento.valorProvisoes,
        valorFundos: apartamento.valorFundos,
        fracao_vagas: fracaoVagas, // Atribui 0 caso não exista
        fracao_total: apartamento.fracao_total
      };

      // Chamada para criar o rateio por apartamento
      await rateiosPorApartamentoController.createRateioPorApartamento(rateioPorApartamento);
    }

    return response.status(201).json(createdRateio);
  } catch (error) {
    console.error('Erro ao criar rateio:', error);
    return response.status(409).json({ error: error.message });
  }
};


const getRateioById = async (request, response) => {
  try {
    const { id } = request.params;
    const rateio = await rateiosModel.getRateioById(id);

    if (rateio) {
      return response.status(200).json(rateio);
    } else {
      return response.status(404).json({ message: 'Rateio não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter rateio:', error);
    return response.status(500).json({ error: 'Erro ao obter rateio' });
  }
};

const getRateiosByBuildingIdAndMonthAndYear = async (request, response) => {
  try {
    const { predioId, mes, ano } = request.params;
    const rateios = await rateiosModel.getRateiosByBuildingIdAndMonthAndYear(predioId, mes, ano);
    return response.status(200).json(rateios);
  } catch (error) {
    console.error('Erro ao obter rateios por prédio, mês e ano:', error);
    return response.status(500).json({ error: 'Erro ao obter rateios por prédio, mês e ano' });
  }
};

const updateRateio = async (request, response) => {
  try {
    const { id } = request.params;
    const rateio = { ...request.body, id };

    const wasUpdated = await rateiosModel.updateRateio(rateio);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Rateio atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Rateio não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar rateio:', error);
    return response.status(500).json({ error: 'Erro ao atualizar rateio' });
  }
};

const deleteRateio = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await rateiosModel.deleteRateio(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Rateio deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Rateio não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar rateio:', error);
    return response.status(500).json({ error: 'Erro ao deletar rateio' });
  }
};


module.exports = {
  getAllRateios,
  createRateio,
  getRateioById,
  getRateiosByBuildingIdAndMonthAndYear,
  updateRateio,
  deleteRateio,
};
