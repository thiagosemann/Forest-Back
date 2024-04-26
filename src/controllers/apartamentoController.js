const apartamentosModel = require('../models/apartamentoModel');

const getAllApartamentos = async (request, response) => {
  try {
    const apartamentos = await apartamentosModel.getAllApartamentos();
    return response.status(200).json(apartamentos);
  } catch (error) {
    console.error('Erro ao obter apartamentos:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamentos' });
  }
};

const createApartamento = async (request, response) => {
  try {
    const createdApartamento = await apartamentosModel.createApartamento(request.body);
    return response.status(201).json(createdApartamento);
  } catch (error) {
    console.error('Erro ao criar apartamento:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getApartamentoById = async (request, response) => {
  try {
    const { id } = request.params;
    const apartamento = await apartamentosModel.getApartamentoById(id);

    if (apartamento) {
      return response.status(200).json(apartamento);
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamento' });
  }
};
const getApartamentosByBuildingId = async (request, response) => {
  try {
    const { id } = request.params;
    const apartamento = await apartamentosModel.getApartamentosByBuildingId(id);

    if (apartamento) {
      return response.status(200).json(apartamento);
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamento' });
  }
};

module.exports = {
  getAllApartamentos,
  createApartamento,
  getApartamentoById,
  getApartamentosByBuildingId
};
