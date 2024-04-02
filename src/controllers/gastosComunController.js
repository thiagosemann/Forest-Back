const commonExpensesModel = require('../models/gastosComunModel');

const getAllCommonExpenses = async (request, response) => {
  try {
    const expenses = await commonExpensesModel.getAllCommonExpenses();
    return response.status(200).json(expenses);
  } catch (error) {
    console.error('Erro ao obter gastos comuns:', error);
    return response.status(500).json({ error: 'Erro ao obter gastos comuns' });
  }
};

const createCommonExpense = async (request, response) => {
  try {
    const createdExpense = await commonExpensesModel.createCommonExpense(request.body);
    return response.status(201).json(createdExpense);
  } catch (error) {
    console.error('Erro ao criar gasto comum:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getCommonExpense = async (request, response) => {
  try {
    const { id } = request.params;
    const expense = await commonExpensesModel.getCommonExpense(id);

    if (expense) {
      return response.status(200).json(expense);
    } else {
      return response.status(404).json({ message: 'Gasto comum não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter gasto comum:', error);
    return response.status(500).json({ error: 'Erro ao obter gasto comum' });
  }
};

const updateCommonExpense = async (request, response) => {
  try {
    const { id } = request.params;
    const updatedExpense = await commonExpensesModel.updateCommonExpense(id, request.body);
    return response.status(200).json(updatedExpense);
  } catch (error) {
    console.error('Erro ao atualizar gasto comum:', error);
    return response.status(500).json({ error: 'Erro ao atualizar gasto comum' });
  }
};

const deleteCommonExpense = async (request, response) => {
  try {
    const { id } = request.params;
    const deletedExpense = await commonExpensesModel.deleteCommonExpense(id);
    if (deletedExpense) {
      return response.status(200).json({ message: 'Gasto comum excluído com sucesso.' });
    } else {
      return response.status(404).json({ message: 'Gasto comum não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao excluir gasto comum:', error);
    return response.status(500).json({ error: 'Erro ao excluir gasto comum.' });
  }
};

module.exports = {
  getAllCommonExpenses,
  createCommonExpense,
  getCommonExpense,
  updateCommonExpense,
  deleteCommonExpense
};
