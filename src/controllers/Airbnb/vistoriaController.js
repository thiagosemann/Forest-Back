// controllers/vistoriaController.js

const vistoriaModel = require('../../models/Airbnb/vistoriaModel');

// 1) Listar todas as vistorias
const getAllVistorias = async (req, res) => {
  try {
    const vistorias = await vistoriaModel.getAllVistorias();
    return res.status(200).json(vistorias);
  } catch (error) {
    console.error('Erro ao obter vistorias:', error);
    return res.status(500).json({ error: 'Erro ao obter vistorias' });
  }
};

// 2) Buscar vistoria por ID (agora já traz todas as colunas de checklist)
const getVistoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const vistoria = await vistoriaModel.getVistoriaById(id);

    if (!vistoria) {
      return res.status(404).json({ message: 'Vistoria não encontrada' });
    }

    return res.status(200).json(vistoria);
  } catch (error) {
    console.error('Erro ao obter vistoria:', error);
    return res.status(500).json({ error: 'Erro ao obter vistoria' });
  }
};

// 3) Criar vistoria (agora com todos os campos de checklist na própria tabela)
const createVistoria = async (req, res) => {
  try {
    // req.body deve conter: apartamento_id, user_id, data, observacoes_gerais,
    // e todas as colunas de checklist (boolean + *_obs)
    const dataObj = req.body;
    const { insertId: vistoriaId } = await vistoriaModel.createVistoria(dataObj);
    return res.status(201).json({ vistoriaId });
  } catch (error) {
    console.error('Erro ao criar vistoria:', error);
    return res.status(500).json({ error: 'Erro ao criar vistoria' });
  }
};

// 4) Atualizar vistoria (todos os campos agora são colunas de vistoria)
const updateVistoria = async (req, res) => {
  try {
    const { id } = req.params;
    // req.body deve conter quaisquer campos a atualizar (incluindo checklist)
    const dataObj = { id: Number(id), ...req.body };
    const wasUpdated = await vistoriaModel.updateVistoria(dataObj);

    if (wasUpdated) {
      return res.status(200).json({ message: 'Vistoria atualizada com sucesso' });
    } else {
      return res.status(404).json({ message: 'Vistoria não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar vistoria:', error);
    return res.status(500).json({ error: 'Erro ao atualizar vistoria' });
  }
};

// 5) Deletar vistoria
const deleteVistoria = async (req, res) => {
  try {
    const { id } = req.params;
    const wasDeleted = await vistoriaModel.deleteVistoria(id);

    if (wasDeleted) {
      return res.status(200).json({ message: 'Vistoria deletada com sucesso' });
    } else {
      return res.status(404).json({ message: 'Vistoria não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar vistoria:', error);
    return res.status(500).json({ error: 'Erro ao deletar vistoria' });
  }
};

module.exports = {
  getAllVistorias,
  getVistoriaById,
  createVistoria,
  updateVistoria,
  deleteVistoria
};
