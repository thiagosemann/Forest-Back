const provisoesModel = require('../models/provisaoModel');

const getAllProvisoes = async (request, response) => {
  try {
    const provisoes = await provisoesModel.getAllProvisoes();
    return response.status(200).json(provisoes);
  } catch (error) {
    console.error('Erro ao obter provisões:', error);
    return response.status(500).json({ error: 'Erro ao obter provisões' });
  }
};

const createProvisao = async (request, response) => {
  try {
    const createdProvisao = await provisoesModel.createProvisao(request.body);
    return response.status(201).json(createdProvisao);
  } catch (error) {
    console.error('Erro ao criar provisão:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getProvisaoById = async (request, response) => {
  try {
    const { id } = request.params;
    const provisao = await provisoesModel.getProvisaoById(id);

    if (provisao) {
      return response.status(200).json(provisao);
    } else {
      return response.status(404).json({ message: 'Provisão não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao obter provisão:', error);
    return response.status(500).json({ error: 'Erro ao obter provisão' });
  }
};

const getProvisoesByBuildingId = async (request, response) => {
  try {
    const { predioId } = request.params;
    const provisoes = await provisoesModel.getProvisoesByBuildingId(predioId);
    return response.status(200).json(provisoes);
  } catch (error) {
    console.error('Erro ao obter provisões por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter provisões por prédio' });
  }
};

const updateProvisao = async (request, response) => {
  try {
    const { id } = request.params;
    const provisao = { ...request.body, id };

    const wasUpdated = await provisoesModel.updateProvisao(provisao);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Provisão atualizada com sucesso' });
    } else {
      return response.status(404).json({ message: 'Provisão não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar provisão:', error);
    return response.status(500).json({ error: 'Erro ao atualizar provisão' });
  }
};

const deleteProvisao = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await provisoesModel.deleteProvisao(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Provisão deletada com sucesso' });
    } else {
      return response.status(404).json({ message: 'Provisão não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar provisão:', error);
    return response.status(500).json({ error: 'Erro ao deletar provisão' });
  }
};

module.exports = {
  getAllProvisoes,
  createProvisao,
  getProvisaoById,
  getProvisoesByBuildingId,
  updateProvisao,
  deleteProvisao
};
