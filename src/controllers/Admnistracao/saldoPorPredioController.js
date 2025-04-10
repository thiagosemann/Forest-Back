const saldosModel = require('../../models/Administracao/saldoPorPredioModel');

const getAllSaldos = async (request, response) => {
  try {
    const saldos = await saldosModel.getAllSaldos();
    return response.status(200).json(saldos);
  } catch (error) {
    console.error('Erro ao obter saldos:', error);
    return response.status(500).json({ error: 'Erro ao obter saldos' });
  }
};

const createSaldo = async (request, response) => {
  try {
    const createdSaldo = await saldosModel.createSaldo(request.body);
    return response.status(201).json(createdSaldo);
  } catch (error) {
    console.error('Erro ao criar saldo:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getSaldoById = async (request, response) => {
  try {
    const { id } = request.params;
    const saldo = await saldosModel.getSaldoById(id);

    if (saldo) {
      return response.status(200).json(saldo);
    } else {
      return response.status(404).json({ message: 'Saldo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter saldo:', error);
    return response.status(500).json({ error: 'Erro ao obter saldo' });
  }
};

const getSaldosByBuildingId = async (request, response) => {
  try {
    const { predioId } = request.params;
    const saldos = await saldosModel.getSaldosByBuildingId(predioId);
    return response.status(200).json(saldos);
  } catch (error) {
    console.error('Erro ao obter saldos por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter saldos por prédio' });
  }
};

const updateSaldo = async (request, response) => {
  try {
    const { id } = request.params;
    const saldo = { ...request.body, id };
    const wasUpdated = await saldosModel.updateSaldo(saldo);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Saldo atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Saldo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar saldo:', error);
    return response.status(500).json({ error: 'Erro ao atualizar saldo' });
  }
};

const deleteSaldo = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await saldosModel.deleteSaldo(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Saldo deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Saldo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar saldo:', error);
    return response.status(500).json({ error: 'Erro ao deletar saldo' });
  }
};

module.exports = {
  getAllSaldos,
  createSaldo,
  getSaldoById,
  getSaldosByBuildingId,
  updateSaldo,
  deleteSaldo
};
