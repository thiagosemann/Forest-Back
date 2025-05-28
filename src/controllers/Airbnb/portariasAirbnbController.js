const portariaModel = require('../../models/Airbnb/portariasAirbnbModel');

const getAllPortarias = async (req, res) => {
  try {
    const portarias = await portariaModel.getAllPortarias();
    return res.status(200).json(portarias);
  } catch (error) {
    console.error('Erro ao obter portarias:', error);
    return res.status(500).json({ error: 'Erro ao obter portarias' });
  }
};

const createPortaria = async (req, res) => {
  try {
    const created = await portariaModel.createPortaria(req.body);
    return res.status(201).json(created);
  } catch (error) {
    console.error('Erro ao criar portaria:', error);
    return res.status(400).json({ error: error.message });
  }
};

const getPortariaById = async (req, res) => {
  try {
    const { id } = req.params;
    const portaria = await portariaModel.getPortariaById(id);

    if (portaria) {
      return res.status(200).json(portaria);
    } else {
      return res.status(404).json({ message: 'Portaria não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao obter portaria:', error);
    return res.status(500).json({ error: 'Erro ao obter portaria' });
  }
};

const updatePortaria = async (req, res) => {
  try {
    const { id } = req.params;
    const portariaData = { ...req.body, id };

    const wasUpdated = await portariaModel.updatePortaria(portariaData);

    if (wasUpdated) {
      return res.status(200).json({ message: 'Portaria atualizada com sucesso' });
    } else {
      return res.status(404).json({ message: 'Portaria não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar portaria:', error);
    return res.status(500).json({ error: 'Erro ao atualizar portaria' });
  }
};

const deletePortaria = async (req, res) => {
  try {
    const { id } = req.params;
    const wasDeleted = await portariaModel.deletePortaria(id);

    if (wasDeleted) {
      return res.status(200).json({ message: 'Portaria deletada com sucesso' });
    } else {
      return res.status(404).json({ message: 'Portaria não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar portaria:', error);
    return res.status(500).json({ error: 'Erro ao deletar portaria' });
  }
};

module.exports = {
  getAllPortarias,
  createPortaria,
  getPortariaById,
  updatePortaria,
  deletePortaria
};
