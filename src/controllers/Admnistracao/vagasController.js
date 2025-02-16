const vagasModel = require('../../models/Administracao/vagasModel');

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

// Função para atualizar uma vaga existente
const updateVaga = async (request, response) => {
  try {
    const { id } = request.params;
    const vaga = { ...request.body, id };

    const wasUpdated = await vagasModel.updateVaga(vaga);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Vaga atualizada com sucesso' });
    } else {
      return response.status(404).json({ message: 'Vaga não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);
    return response.status(500).json({ error: 'Erro ao atualizar vaga' });
  }
};

// Função para deletar uma vaga
const deleteVaga = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await vagasModel.deleteVaga(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Vaga deletada com sucesso' });
    } else {
      return response.status(404).json({ message: 'Vaga não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar vaga:', error);
    return response.status(500).json({ error: 'Erro ao deletar vaga' });
  }
};


module.exports = {
  getAllVagas,
  createVaga,
  getVagaById,
  getVagasByBuildingId,
  getVagasByApartamentId,
  updateVaga, // Exporta a função de atualização
  deleteVaga
};
