const predioModel = require('../../models/Airbnb/predioAirbnbModel');

const getAllPredios = async (request, response) => {
  try {
    const { empresaId } = request;
    const predios = await predioModel.getAllPredios(empresaId);
    return response.status(200).json(predios);
  } catch (error) {
    console.error('Erro ao obter prédios:', error);
    return response.status(500).json({ error: 'Erro ao obter prédios' });
  }
};

const createPredio = async (request, response) => {
  try {
    const { empresaId } = request;
    const createdPredio = await predioModel.createPredio({ ...request.body, empresa_id: empresaId });
    return response.status(201).json(createdPredio);
  } catch (error) {
    console.error('Erro ao criar prédio:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getPredioById = async (request, response) => {
  try {
    const { id } = request.params;
    const { empresaId } = request;
    const predio = await predioModel.getPredioById(id, empresaId);

    if (predio) {
      return response.status(200).json(predio);
    } else {
      return response.status(404).json({ message: 'Prédio não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter prédio' });
  }
};

const updatePredio = async (request, response) => {
  try {
    const { id } = request.params;
    const predio = { ...request.body, id };

    const wasUpdated = await predioModel.updatePredio(predio);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Prédio atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Prédio não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar prédio:', error);
    return response.status(500).json({ error: 'Erro ao atualizar prédio' });
  }
};

const deletePredio = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await predioModel.deletePredio(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Prédio deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Prédio não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar prédio:', error);
    return response.status(500).json({ error: 'Erro ao deletar prédio' });
  }
};

module.exports = {
  getAllPredios,
  createPredio,
  getPredioById,
  updatePredio,
  deletePredio
};