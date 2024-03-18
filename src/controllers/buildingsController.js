const buildingsModel = require('../models/buildingsModel');

const getAllBuildings = async (request, response) => {
  try {
    const buildings = await buildingsModel.getAllBuildings();
    return response.status(200).json(buildings);
  } catch (error) {
    console.error('Erro ao obter prédios:', error);
    return response.status(500).json({ error: 'Erro ao obter prédios' });
  }
};

const createBuilding = async (request, response) => {
  try {
    const createdBuilding = await buildingsModel.createBuilding(request.body);
    return response.status(201).json(createdBuilding);
  } catch (error) {
    console.error('Erro ao criar prédio:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getBuilding = async (request, response) => {
  try {
    const { id } = request.params;
    const building = await buildingsModel.getBuilding(id);

    if (building) {
      return response.status(200).json(building);
    } else {
      return response.status(404).json({ message: 'Prédio não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter prédio' });
  }
};

const updateBuilding = async (request, response) => {
  try {
    const { id } = request.params;
    const updatedBuilding = await buildingsModel.updateBuilding(id, request.body);
    return response.status(200).json(updatedBuilding);
  } catch (error) {
    console.error('Erro ao atualizar prédio:', error);
    return response.status(500).json({ error: 'Erro ao atualizar prédio' });
  }
};

const deleteBuilding = async (request, response) => {
  try {
    const { id } = request.params;
    const deletedBuilding = await buildingsModel.deleteBuilding(id);
    if (deletedBuilding) {
      return response.status(200).json({ message: 'Prédio excluído com sucesso.' });
    } else {
      return response.status(404).json({ message: 'Prédio não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao excluir prédio:', error);
    return response.status(500).json({ error: 'Erro ao excluir prédio.' });
  }
};

module.exports = {
  getAllBuildings,
  createBuilding,
  getBuilding,
  updateBuilding,
  deleteBuilding
};
