const predioPortariaModel = require('../../models/Airbnb/prediosPortariasModel');

// Listar todas as associações
const getAllPredioPortaria = async (req, res) => {
  try {
    const associations = await predioPortariaModel.getAllPredioPortaria();
    return res.status(200).json(associations);
  } catch (error) {
    console.error('Erro ao obter associações prédio-portaria:', error);
    return res.status(500).json({ error: 'Erro ao obter associações' });
  }
};

// Listar portarias de um prédio
const getPortariasByPredio = async (req, res) => {
  const { predioId } = req.params;
  try {
    const portarias = await predioPortariaModel.getPortariasByPredio(predioId);
    return res.status(200).json(portarias);
  } catch (error) {
    console.error(`Erro ao obter portarias do prédio ${predioId}:`, error);
    return res.status(500).json({ error: 'Erro ao obter portarias do prédio' });
  }
};

// Listar prédios de uma portaria
const getPrediosByPortaria = async (req, res) => {
  const { portariaId } = req.params;
  try {
    const predios = await predioPortariaModel.getPrediosByPortaria(portariaId);
    return res.status(200).json(predios);
  } catch (error) {
    console.error(`Erro ao obter prédios da portaria ${portariaId}:`, error);
    return res.status(500).json({ error: 'Erro ao obter prédios da portaria' });
  }
};

// Vincular portaria a prédio
const linkPortariaToPredio = async (req, res) => {
  const { portariaId, predioId } = req.body;
  if (!portariaId || !predioId) {
    return res.status(400).json({ error: 'É necessário informar portariaId e predioId' });
  }
  try {
    await predioPortariaModel.linkPortariaToPredio(portariaId, predioId);
    return res.status(201).json({ message: 'Vínculo criado com sucesso' });
  } catch (error) {
    console.error(`Erro ao vincular portaria ${portariaId} ao prédio ${predioId}:`, error);
    return res.status(500).json({ error: 'Erro ao criar vínculo' });
  }
};

// Remover vínculo
const unlinkPortariaFromPredio = async (req, res) => {
  const { portariaId, predioId } = req.body;
  if (!portariaId || !predioId) {
    return res.status(400).json({ error: 'É necessário informar portariaId e predioId' });
  }
  try {
    const removed = await predioPortariaModel.unlinkPortariaFromPredio(portariaId, predioId);
    if (removed) {
      return res.status(200).json({ message: 'Vínculo removido com sucesso' });
    }
    return res.status(404).json({ message: 'Vínculo não encontrado' });
  } catch (error) {
    console.error(`Erro ao remover vínculo portaria ${portariaId} do prédio ${predioId}:`, error);
    return res.status(500).json({ error: 'Erro ao remover vínculo' });
  }
};

module.exports = {
  getAllPredioPortaria,
  getPortariasByPredio,
  getPrediosByPortaria,
  linkPortariaToPredio,
  unlinkPortariaFromPredio,
};