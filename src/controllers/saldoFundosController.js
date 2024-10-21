const saldoFundosModel = require('../models/saldoFundosModel');

const getAllSaldoFundos = async (request, response) => {
  try {
    const saldos = await saldoFundosModel.getAllSaldoFundos();
    return response.status(200).json(saldos);
  } catch (error) {
    console.error('Erro ao obter saldo de fundos:', error);
    return response.status(500).json({ error: 'Erro ao obter saldo de fundos' });
  }
};

const createSaldoFundo = async (request, response) => {
  try {
    const createdSaldoFundo = await saldoFundosModel.createSaldoFundo(request.body);
    return response.status(201).json(createdSaldoFundo);
  } catch (error) {
    console.error('Erro ao criar saldo de fundo:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getSaldoFundoById = async (request, response) => {
  try {
    const { id } = request.params;
    const saldo = await saldoFundosModel.getSaldoFundoById(id);

    if (saldo) {
      return response.status(200).json(saldo);
    } else {
      return response.status(404).json({ message: 'Saldo de fundo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter saldo de fundo:', error);
    return response.status(500).json({ error: 'Erro ao obter saldo de fundo' });
  }
};

const getSaldoFundosByFundoId = async (request, response) => {
  try {
    const { fundoId } = request.params;
    const saldos = await saldoFundosModel.getSaldoFundosByFundoId(fundoId);
    return response.status(200).json(saldos);
  } catch (error) {
    console.error('Erro ao obter saldo de fundos por fundo:', error);
    return response.status(500).json({ error: 'Erro ao obter saldo de fundos por fundo' });
  }
};

// Nova função para buscar saldo de fundos por predio_id
const getSaldoFundosByBuildingId = async (request, response) => {
  try {
    const { predioId } = request.params;
    const fundosComSaldos = await saldoFundosModel.getSaldoFundosByBuildingId(predioId);
    return response.status(200).json(fundosComSaldos);
  } catch (error) {
    console.error('Erro ao obter saldo de fundos por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter saldo de fundos por prédio' });
  }
};

const updateSaldoFundo = async (request, response) => {
  try {
    const { id } = request.params;
    const saldoFundo = { ...request.body, id };

    const wasUpdated = await saldoFundosModel.updateSaldoFundo(saldoFundo);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Saldo de fundo atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Saldo de fundo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar saldo de fundo:', error);
    return response.status(500).json({ error: 'Erro ao atualizar saldo de fundo' });
  }
};

const deleteSaldoFundo = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await saldoFundosModel.deleteSaldoFundo(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Saldo de fundo deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Saldo de fundo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar saldo de fundo:', error);
    return response.status(500).json({ error: 'Erro ao deletar saldo de fundo' });
  }
};

module.exports = {
  getAllSaldoFundos,
  createSaldoFundo,
  getSaldoFundoById,
  getSaldoFundosByFundoId,
  getSaldoFundosByBuildingId, // Adicionada a nova função aqui
  updateSaldoFundo,
  deleteSaldoFundo
};
