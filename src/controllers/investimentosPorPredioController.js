const investimentosModel = require('../models/investimentosPorPredioModel');

const getAllInvestimentos = async (request, response) => {
  try {
    const investimentos = await investimentosModel.getAllInvestimentos();
    return response.status(200).json(investimentos);
  } catch (error) {
    console.error('Erro ao obter investimentos:', error);
    return response.status(500).json({ error: 'Erro ao obter investimentos' });
  }
};

const createInvestimento = async (request, response) => {
  try {
    const createdInvestimento = await investimentosModel.createInvestimento(request.body);
    return response.status(201).json(createdInvestimento);
  } catch (error) {
    console.error('Erro ao criar investimento:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getInvestimentoById = async (request, response) => {
  try {
    const { id } = request.params;
    const investimento = await investimentosModel.getInvestimentoById(id);

    if (investimento) {
      return response.status(200).json(investimento);
    } else {
      return response.status(404).json({ message: 'Investimento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter investimento:', error);
    return response.status(500).json({ error: 'Erro ao obter investimento' });
  }
};

const getInvestimentosByBuildingId = async (request, response) => {
  try {
    const { predioId } = request.params;
    const investimentos = await investimentosModel.getInvestimentosByBuildingId(predioId);
    return response.status(200).json(investimentos);
  } catch (error) {
    console.error('Erro ao obter investimentos por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter investimentos por prédio' });
  }
};

const updateInvestimento = async (request, response) => {
  try {
    const { id } = request.params;
    const investimento = { ...request.body, id };

    const wasUpdated = await investimentosModel.updateInvestimento(investimento);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Investimento atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Investimento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar investimento:', error);
    return response.status(500).json({ error: 'Erro ao atualizar investimento' });
  }
};

const deleteInvestimento = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await investimentosModel.deleteInvestimento(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Investimento deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Investimento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar investimento:', error);
    return response.status(500).json({ error: 'Erro ao deletar investimento' });
  }
};

module.exports = {
  getAllInvestimentos,
  createInvestimento,
  getInvestimentoById,
  getInvestimentosByBuildingId,
  updateInvestimento,
  deleteInvestimento
};
