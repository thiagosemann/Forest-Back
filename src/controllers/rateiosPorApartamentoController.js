const rateiosPorApartamentoModel = require('../models/rateioPorApartamentoModel');

const getAllRateiosPorApartamento = async (request, response) => {
  try {
    const rateios = await rateiosPorApartamentoModel.getAllRateiosPorApartamento();
    return response.status(200).json(rateios);
  } catch (error) {
    console.error('Erro ao obter rateios por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter rateios por apartamento' });
  }
};

const createRateioPorApartamento = async (data) => {
  try {
    const createdRateio = await rateiosPorApartamentoModel.createRateioPorApartamento(data);
    return createdRateio;
  } catch (error) {
    console.error('Erro ao criar rateio por apartamento:', error);
    throw new Error(error.message);
  }
};


const getRateioPorApartamentoById = async (request, response) => {
  try {
    const { id } = request.params;
    const rateio = await rateiosPorApartamentoModel.getRateioPorApartamentoById(id);

    if (rateio) {
      return response.status(200).json(rateio);
    } else {
      return response.status(404).json({ message: 'Rateio por apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter rateio por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter rateio por apartamento' });
  }
};

const getRateiosPorApartamentoByRateioId = async (request, response) => {
  try {
    const { rateioId } = request.params;
    const rateios = await rateiosPorApartamentoModel.getRateiosPorRateioId(rateioId);
    return response.status(200).json(rateios);
  } catch (error) {
    console.error('Erro ao obter rateios por apartamento por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter rateios por apartamento por prédio' });
  }
};


const updateRateioPorApartamento = async (request, response) => {
  try {
    const { id } = request.params;
    const rateio = { ...request.body, id };

    const wasUpdated = await rateiosPorApartamentoModel.updateRateioPorApartamento(rateio);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Rateio por apartamento atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Rateio por apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar rateio por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao atualizar rateio por apartamento' });
  }
};

const deleteRateioPorApartamento = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await rateiosPorApartamentoModel.deleteRateioPorApartamento(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Rateio por apartamento deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Rateio por apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar rateio por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao deletar rateio por apartamento' });
  }
};

module.exports = {
  getAllRateiosPorApartamento,
  createRateioPorApartamento,
  getRateioPorApartamentoById,
  getRateiosPorApartamentoByRateioId,
  updateRateioPorApartamento,
  deleteRateioPorApartamento,
};
