const commonExpensesModel = require('../../models/Administracao/gastosComunModel');

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

const createCommonExpenses = async (request, response) => {
  try {
    const commonExpenses = request.body;
    const createdExpenses = await Promise.all(commonExpenses.map(expense => commonExpensesModel.createCommonExpense(expense)));
    return response.status(201).json(createdExpenses);
  } catch (error) {
    console.error('Erro ao criar gastos comuns:', error);
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

const getExpensesByBuildingAndMonth = async (request, response) => {
  try {
    const { predio_id, month, year } = request.params;
    const expenses = await commonExpensesModel.getExpensesByBuildingAndMonth(predio_id, month, year);

    if (expenses.length > 0) {
      return response.status(200).json(expenses);
    } else {
      return response.status(404).json({ message: 'Nenhum gasto encontrado para o prédio, mês e ano especificados' });
    }
  } catch (error) {
    console.error('Erro ao obter gastos por prédio e mês:', error);
    return response.status(500).json({ error: 'Erro ao obter gastos por prédio e mês' });
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

const getProvisoesByBuilding = async (request, response) => {
  try {
    const { predio_id } = request.params;
    const expenses = await commonExpensesModel.getProvisoesByBuilding(predio_id);

    if (expenses.length > 0) {
      return response.status(200).json(expenses);
    } else {
      return response.status(404).json({ message: 'Nenhuma provisão encontrada para o prédio especificado' });
    }
  } catch (error) {
    console.error('Erro ao obter provisões por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter provisões por prédio' });
  }
};


module.exports = {
  getAllCommonExpenses,
  createCommonExpense,
  createCommonExpenses,
  getCommonExpense,
  updateCommonExpense,
  deleteCommonExpense,
  getExpensesByBuildingAndMonth,
  getProvisoesByBuilding 
};
