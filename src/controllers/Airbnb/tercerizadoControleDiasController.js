const model = require('../../models/Airbnb/tercerizadoControleDiasModel');

const getAllDisponibilidades = async (request, response) => {
  try {
    const { empresaId } = request;
    const rows = await model.getAll(empresaId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter disponibilidades:', error);
    return response.status(500).json({ error: 'Erro ao obter disponibilidades' });
  }
};

const getDisponibilidadeById = async (request, response) => {
  try {
    const { id } = request.params;
    const { empresaId } = request;
    const row = await model.getById(id, empresaId);
    if (!row) return response.status(404).json({ message: 'Disponibilidade não encontrada' });
    return response.status(200).json(row);
  } catch (error) {
    console.error('Erro ao obter disponibilidade por ID:', error);
    return response.status(500).json({ error: 'Erro ao obter disponibilidade por ID' });
  }
};

const getDisponibilidadesByUserId = async (request, response) => {
  try {
    const { userId } = request.params;
    const { empresaId } = request;
    const rows = await model.getByUserId(userId, empresaId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter disponibilidades por usuário:', error);
    return response.status(500).json({ error: 'Erro ao obter disponibilidades por usuário' });
  }
};

const createDisponibilidade = async (request, response) => {
  try {
    const data = { ...request.body, empresa_id: request.empresaId };
    const created = await model.create(data);
    return response.status(201).json(created);
  } catch (error) {
    console.error('Erro ao criar disponibilidade:', error);
    return response.status(409).json({ error: error.message });
  }
};

const updateDisponibilidade = async (request, response) => {
  try {
    const { id } = request.params;
    const data = { ...request.body, empresa_id: request.empresaId };
    const wasUpdated = await model.update(id, data);
    if (!wasUpdated) return response.status(404).json({ message: 'Disponibilidade não encontrada' });
    return response.status(200).json({ message: 'Disponibilidade atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar disponibilidade:', error);
    return response.status(500).json({ error: error.message });
  }
};

const deleteDisponibilidade = async (request, response) => {
  try {
    const { id } = request.params;
    const wasDeleted = await model.remove(id);
    if (!wasDeleted) return response.status(404).json({ message: 'Disponibilidade não encontrada' });
    return response.status(200).json({ message: 'Disponibilidade deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar disponibilidade:', error);
    return response.status(500).json({ error: 'Erro ao deletar disponibilidade' });
  }
};

module.exports = {
  getAllDisponibilidades,
  getDisponibilidadeById,
  getDisponibilidadesByUserId,
  createDisponibilidade,
  updateDisponibilidade,
  deleteDisponibilidade,
};
