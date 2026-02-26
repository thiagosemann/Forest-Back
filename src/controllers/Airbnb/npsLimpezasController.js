const npsModel = require('../../models/Airbnb/npsModel');
const getAllNps = async (request, response) => {
  try {
    const { empresaId } = request;
    const rows = await npsModel.getAllNps(empresaId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter NPS:', error);
    return response.status(500).json({ error: 'Erro ao obter NPS' });
  }
};

const getNpsById = async (request, response) => {
  try {
    const { id } = request.params;
    const { empresaId } = request;
    const row = await npsModel.getNpsById(id, empresaId);
    if (row) {
      return response.status(200).json(row);
    } else {
      return response.status(404).json({ message: 'NPS não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter NPS por ID:', error);
    return response.status(500).json({ error: 'Erro ao obter NPS por ID' });
  }
};

const getNpsByApartamentoId = async (request, response) => {
  try {
    const { apartamentoId } = request.params;
    const { empresaId } = request;
    if (!apartamentoId) {
      return response.status(400).json({ error: 'apartamentoId é obrigatório' });
    }
    const rows = await npsModel.getNpsByApartamentoId(apartamentoId, empresaId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter NPS por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter NPS por apartamento' });
  }
};

const getNpsByUserId = async (request, response) => {
  try {
    const { userId } = request.params;
    const { empresaId } = request;
    if (!userId) {
      return response.status(400).json({ error: 'userId é obrigatório' });
    }
    const rows = await npsModel.getNpsByUserId(userId, empresaId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter NPS por usuário:', error);
    return response.status(500).json({ error: 'Erro ao obter NPS por usuário' });
  }
};

const createNps = async (request, response) => {
  try {
    const data = { ...request.body, empresa_id: request.empresaId };
    const created = await npsModel.createNps(data);
    return response.status(201).json(created);
  } catch (error) {
    console.error('Erro ao criar NPS:', error);
    return response.status(409).json({ error: error.message });
  }
};

const updateNps = async (request, response) => {
  try {
    const { id } = request.params;
    const data = { ...request.body, empresa_id: request.empresaId };
    const wasUpdated = await npsModel.updateNps(id, data);
    if (wasUpdated) {
      return response.status(200).json({ message: 'NPS atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'NPS não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar NPS:', error);
    return response.status(500).json({ error: 'Erro ao atualizar NPS' });
  }
};

const deleteNps = async (request, response) => {
  try {
    const { id } = request.params;
    const wasDeleted = await npsModel.deleteNps(id);
    if (wasDeleted) {
      return response.status(200).json({ message: 'NPS deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'NPS não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar NPS:', error);
    return response.status(500).json({ error: 'Erro ao deletar NPS' });
  }
};

module.exports = {
  getAllNps,
  getNpsById,
  getNpsByApartamentoId,
  getNpsByUserId,
  createNps,
  updateNps,
  deleteNps,
};
