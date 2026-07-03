// controllers/provisionamentoController.js
const provisionamentoModel = require('../../models/Airbnb/provisionamentoModel');

// Extrai filtros de período/tipo da query string
const extractFiltros = (req) => ({
  dataInicio: req.query.dataInicio || null,
  dataFim: req.query.dataFim || null,
  tipo: req.query.tipo || null,
});

// Listar todos os provisionamentos da empresa
const getAll = async (req, res) => {
  try {
    const rows = await provisionamentoModel.getAll(req.empresaId, extractFiltros(req));
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter provisionamentos:', error);
    return res.status(500).json({ error: 'Erro ao obter provisionamentos' });
  }
};

// Resumo agregado (totais por status efetivo x tipo)
const getResumo = async (req, res) => {
  try {
    const resumo = await provisionamentoModel.getResumo(req.empresaId, extractFiltros(req));
    return res.status(200).json(resumo);
  } catch (error) {
    console.error('Erro ao obter resumo de provisionamentos:', error);
    return res.status(500).json({ error: 'Erro ao obter resumo de provisionamentos' });
  }
};

// Buscar por id
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await provisionamentoModel.getById(id, req.empresaId);
    if (!item) {
      return res.status(404).json({ message: 'Provisionamento não encontrado' });
    }
    return res.status(200).json(item);
  } catch (error) {
    console.error('Erro ao buscar provisionamento:', error);
    return res.status(500).json({ error: 'Erro ao buscar provisionamento' });
  }
};

// Criar novo provisionamento
const create = async (req, res) => {
  try {
    const dados = req.body || {};
    const result = await provisionamentoModel.create(dados, req.empresaId);
    return res.status(201).json({ message: 'Provisionamento criado com sucesso', insertId: result.insertId });
  } catch (error) {
    console.error('Erro ao criar provisionamento:', error);
    return res.status(500).json({ error: error.message || 'Erro ao criar provisionamento' });
  }
};

// Atualizar provisionamento existente
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body || {};
    const result = await provisionamentoModel.update(id, dados, req.empresaId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Provisionamento não encontrado' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao atualizar provisionamento:', error);
    return res.status(500).json({ error: error.message || 'Erro ao atualizar provisionamento' });
  }
};

// Deletar provisionamento
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await provisionamentoModel.remove(id, req.empresaId);
    if (!deleted) {
      return res.status(404).json({ message: 'Provisionamento não encontrado' });
    }
    return res.status(200).json({ message: 'Provisionamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar provisionamento:', error);
    return res.status(500).json({ error: 'Erro ao deletar provisionamento' });
  }
};

module.exports = {
  getAll,
  getResumo,
  getById,
  create,
  update,
  remove,
};
