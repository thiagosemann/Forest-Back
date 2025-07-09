// controllers/ticketReembolsoController.js
const ticketModel = require('../../models/Airbnb/ticketReembolsoModel');

// Buscar todos os tickets
const getAllReembolsos = async (_req, res) => {
  try {
    const tickets = await ticketModel.getAllReembolsos();
    return res.status(200).json(tickets);
  } catch (error) {
    console.error('Erro ao obter tickets:', error);
    return res.status(500).json({ error: 'Erro ao obter tickets' });
  }
};

// Buscar um ticket por ID
const getReembolsoById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await ticketModel.getReembolsoById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }
    return res.status(200).json(ticket);
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    return res.status(500).json({ error: 'Erro ao buscar ticket' });
  }
};

// Criar um novo ticket
const createReembolso = async (req, res) => {
  try {
    const { arquivos, ...dados } = req.body;
    const result = await ticketModel.createReembolso(dados, arquivos);
    return res.status(201).json({ message: 'Ticket criado com sucesso', insertId: result.insertId });
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    return res.status(500).json({ error: 'Erro ao criar ticket' });
  }
};

// Atualizar um ticket existente
const updateReembolso = async (req, res) => {
  try {
    const { id } = req.params;
    const { arquivos, ...dados } = req.body;
    const result = await ticketModel.updateReembolso(id, dados, arquivos);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    return res.status(500).json({ error: 'Erro ao atualizar ticket' });
  }
};

// Deletar um ticket
const deleteReembolso = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ticketModel.deleteReembolso(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }
    return res.status(200).json({ message: 'Ticket deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    return res.status(500).json({ error: 'Erro ao deletar ticket' });
  }
};

module.exports = {
  getAllReembolsos,
  getReembolsoById,
  createReembolso,
  updateReembolso,
  deleteReembolso
};
