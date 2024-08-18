const vagasModel = require('../models/vagasModel');

const getAllVagas = async (request, response) => {
  try {
    const vagas = await vagasModel.getAllVagas();
    return response.status(200).json(vagas);
  } catch (error) {
    console.error('Erro ao obter vagas:', error);
    return response.status(500).json({ error: 'Erro ao obter vagas' });
  }
};

const createVaga = async (request, response) => {
  try {
    const createdVaga = await vagasModel.createVaga(request.body);
    return response.status(201).json(createdVaga);
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getVagaById = async (request, response) => {
  try {
    const { id } = request.params;
    const vaga = await vagasModel.getVagaById(id);

    if (vaga) {
      return response.status(200).json(vaga);
    } else {
      return response.status(404).json({ message: 'Vaga não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao obter vaga:', error);
    return response.status(500).json({ error: 'Erro ao obter vaga' });
  }
};

const getVagasByBuildingId = async (request, response) => {
  try {
    const { predioId } = request.params;
    const vagas = await vagasModel.getVagasByBuildingId(predioId);
    return response.status(200).json(vagas);
  } catch (error) {
    console.error('Erro ao obter vagas por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter vagas por prédio' });
  }
};

const getVagasByApartamentId = async (request, response) => {
  try {
    const { apartamentoId } = request.params;
    const vagas = await vagasModel.getVagasByApartamentId(apartamentoId);
    return response.status(200).json(vagas);
  } catch (error) {
    console.error('Erro ao obter vagas por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter vagas por apartamento' });
  }
};

module.exports = {
  getAllVagas,
  createVaga,
  getVagaById,
  getVagasByBuildingId,
  getVagasByApartamentId,
};
