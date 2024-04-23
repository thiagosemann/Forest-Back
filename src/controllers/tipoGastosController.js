const expenseTypesModel = require('../models/tipoGastosModel');

const getAllExpenseTypes = async (request, response) => {
  try {
    const expenseTypes = await expenseTypesModel.getAllExpenseTypes();
    return response.status(200).json(expenseTypes);
  } catch (error) {
    console.error('Erro ao obter tipos de gastos:', error);
    return response.status(500).json({ error: 'Erro ao obter tipos de gastos' });
  }
};

const createExpenseType = async (request, response) => {
  try {
    const createdExpenseType = await expenseTypesModel.createExpenseType(request.body);
    return response.status(201).json(createdExpenseType);
  } catch (error) {
    console.error('Erro ao criar tipo de gasto:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getExpenseType = async (request, response) => {
  try {
    const { id } = request.params;
    const expenseType = await expenseTypesModel.getExpenseType(id);

    if (expenseType) {
      return response.status(200).json(expenseType);
    } else {
      return response.status(404).json({ message: 'Tipo de gasto não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter tipo de gasto:', error);
    return response.status(500).json({ error: 'Erro ao obter tipo de gasto' });
  }
};

const updateExpenseType = async (request, response) => {
  try {
    const { id } = request.params;
    const updatedExpenseType = await expenseTypesModel.updateExpenseType(id, request.body);
    return response.status(200).json(updatedExpenseType);
  } catch (error) {
    console.error('Erro ao atualizar tipo de gasto:', error);
    return response.status(500).json({ error: 'Erro ao atualizar tipo de gasto' });
  }
};

const deleteExpenseType = async (request, response) => {
  try {
    const { id } = request.params;
    const deletedExpenseType = await expenseTypesModel.deleteExpenseType(id);
    if (deletedExpenseType) {
      return response.status(200).json({ message: 'Tipo de gasto excluído com sucesso.' });
    } else {
      return response.status(404).json({ message: 'Tipo de gasto não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao excluir tipo de gasto:', error);
    return response.status(500).json({ error: 'Erro ao excluir tipo de gasto.' });
  }
};

module.exports = {
  getAllExpenseTypes,
  createExpenseType,
  getExpenseType,
  updateExpenseType,
  deleteExpenseType
};
