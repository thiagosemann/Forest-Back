const individualExpensesModel = require('../models/gastosIndividuaisModel');

const getAllIndividualExpenses = async (request, response) => {
  try {
    const expenses = await individualExpensesModel.getAllIndividualExpenses();
    return response.status(200).json(expenses);
  } catch (error) {
    console.error('Erro ao obter gastos individuais:', error);
    return response.status(500).json({ error: 'Erro ao obter gastos individuais' });
  }
};

const createIndividualExpense = async (request, response) => {
  try {
    const createdExpense = await individualExpensesModel.createIndividualExpense(request.body);
    return response.status(201).json(createdExpense);
  } catch (error) {
    console.error('Erro ao criar gasto individual:', error);
    return response.status(409).json({ error: error.message });
  }
};

const createIndividualExpenses = async (request, response) => {
  try {
    const individualExpenses = request.body;
    const createdExpenses = await Promise.all(individualExpenses.map(expense => individualExpensesModel.createIndividualExpense(expense)));
    return response.status(201).json(createdExpenses);
  } catch (error) {
    console.error('Erro ao criar gastos individuais:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getIndividualExpense = async (request, response) => {
  try {
    const { id } = request.params;
    const expense = await individualExpensesModel.getIndividualExpense(id);

    if (expense) {
      return response.status(200).json(expense);
    } else {
      return response.status(404).json({ message: 'Gasto individual não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter gasto individual:', error);
    return response.status(500).json({ error: 'Erro ao obter gasto individual' });
  }
};

const getExpensesByApartment = async (request, response) => {
  try {
    const { apt_id } = request.params;
    const expenses = await individualExpensesModel.getExpensesByApartment(apt_id);

    if (expenses.length > 0) {
      return response.status(200).json(expenses);
    } else {
      return response.status(404).json({ message: 'Nenhum gasto encontrado para o apartamento especificado' });
    }
  } catch (error) {
    console.error('Erro ao obter gastos por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter gastos por apartamento' });
  }
};

const getIndividualExpensesByAptMonthAndYear = async (request, response) => {
  try {
    const { predio_id, month, year } = request.params;
    const expenses = await individualExpensesModel.getIndividualExpensesByAptMonthAndYear(predio_id, month, year);

    if (expenses.length > 0) {
      return response.status(200).json(expenses);
    } else {
      return response.status(404).json({ message: 'Nenhum gasto encontrado para o prédio, mês e ano especificados' });
    }
  } catch (error) {
    console.error('Erro ao obter gastos por prédio, mês e ano:', error);
    return response.status(500).json({ error: 'Erro ao obter gastos por prédio, mês e ano' });
  }
};

const updateIndividualExpense = async (request, response) => {
  try {
    const { id } = request.params;
    const updatedExpense = await individualExpensesModel.updateIndividualExpense(id, request.body);
    return response.status(200).json(updatedExpense);
  } catch (error) {
    console.error('Erro ao atualizar gasto individual:', error);
    return response.status(500).json({ error: 'Erro ao atualizar gasto individual' });
  }
};

const deleteIndividualExpense = async (request, response) => {
  try {
    const { id } = request.params;
    const deletedExpense = await individualExpensesModel.deleteIndividualExpense(id);
    if (deletedExpense) {
      return response.status(200).json({ message: 'Gasto individual excluído com sucesso.' });
    } else {
      return response.status(404).json({ message: 'Gasto individual não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao excluir gasto individual:', error);
    return response.status(500).json({ error: 'Erro ao excluir gasto individual.' });
  }
};

const deleteIndividualExpensesInBatch = async (request, response) => {
  try {
    const { ids } = request.body; // Espera-se que um array de IDs seja passado no corpo da requisição
    const result = await individualExpensesModel.deleteIndividualExpensesInBatch(ids);

    if (result.affectedRows > 0) {
      return response.status(200).json({ message: 'Gastos individuais excluídos com sucesso.' });
    } else {
      return response.status(404).json({ message: 'Nenhum gasto encontrado para excluir.' });
    }
  } catch (error) {
    console.error('Erro ao excluir gastos individuais em lote:', error);
    return response.status(500).json({ error: 'Erro ao excluir gastos individuais em lote.' });
  }
};


module.exports = {
  getAllIndividualExpenses,
  createIndividualExpense,
  createIndividualExpenses,
  getIndividualExpense,
  updateIndividualExpense,
  deleteIndividualExpense,
  getExpensesByApartment,
  getIndividualExpensesByAptMonthAndYear,
  deleteIndividualExpensesInBatch
};
