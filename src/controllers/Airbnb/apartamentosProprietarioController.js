
const apartamentosProprietarioModel = require('../../models/Airbnb/apartamentosProprietarioModel');

// Adiciona vínculo
const addProprietarioToApartamento = async (req, res) => {
  const { apartamento_id, user_id } = req.body;
  if (!apartamento_id || !user_id) {
    return res.status(400).json({ error: 'apartamento_id e user_id são obrigatórios.' });
  }
  try {
    await apartamentosProprietarioModel.addProprietarioToApartamento(apartamento_id, user_id);
    res.status(201).json({ message: 'Vínculo criado com sucesso.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove vínculo
const removeProprietarioFromApartamento = async (req, res) => {
  const { apartamento_id, user_id } = req.body;
  if (!apartamento_id || !user_id) {
    return res.status(400).json({ error: 'apartamento_id e user_id são obrigatórios.' });
  }
  try {
    const removed = await apartamentosProprietarioModel.removeProprietarioFromApartamento(apartamento_id, user_id);
    if (removed) {
      res.json({ message: 'Vínculo removido com sucesso.' });
    } else {
      res.status(404).json({ error: 'Vínculo não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lista proprietários de um apartamento
const getProprietariosByApartamento = async (req, res) => {
  const { apartamento_id } = req.params;
  try {
    const proprietarios = await apartamentosProprietarioModel.getProprietariosByApartamento(apartamento_id);
    res.json(proprietarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lista apartamentos de um proprietário
const getApartamentosByProprietario = async (req, res) => {
  const { user_id } = req.params;
  try {
    const apartamentos = await apartamentosProprietarioModel.getApartamentosByProprietario(user_id);
    res.json(apartamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove todos os vínculos de um apartamento
const removeAllProprietariosFromApartamento = async (req, res) => {
  const { apartamento_id } = req.body;
  if (!apartamento_id) {
    return res.status(400).json({ error: 'apartamento_id é obrigatório.' });
  }
  try {
    await apartamentosProprietarioModel.removeAllProprietariosFromApartamento(apartamento_id);
    res.json({ message: 'Todos os vínculos removidos do apartamento.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove todos os vínculos de um proprietário
const removeAllApartamentosFromProprietario = async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id é obrigatório.' });
  }
  try {
    await apartamentosProprietarioModel.removeAllApartamentosFromProprietario(user_id);
    res.json({ message: 'Todos os vínculos removidos do proprietário.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addProprietarioToApartamento,
  removeProprietarioFromApartamento,
  getProprietariosByApartamento,
  getApartamentosByProprietario,
  removeAllProprietariosFromApartamento,
  removeAllApartamentosFromProprietario
};
