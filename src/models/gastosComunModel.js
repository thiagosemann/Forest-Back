const connection = require('./connection');

const getAllCommonExpenses = async () => {
  try {
    const [expenses] = await connection.execute('SELECT * FROM Gastos_Comuns');
    return expenses;
  } catch (error) {
    console.error('Erro ao buscar gastos comuns:', error);
    throw error;
  }
};

const createCommonExpense = async (expense) => {
  const { data_gasto, detalhes, valor, tipo, parcela, total_parcelas, predio_id } = expense;

  // Converta o valor para um tipo numérico, se necessário
  const valorNumerico = parseFloat(valor);

  const selectExpenseQuery = 'SELECT * FROM Gastos_Comuns WHERE data_gasto = ? AND detalhes = ? AND valor = ? AND tipo = ? AND parcela = ? AND total_parcelas = ? AND predio_id = ?';
  const selectValues = [data_gasto, detalhes, valorNumerico, tipo, parcela, total_parcelas, predio_id];
  
  // Verifica se já existe um gasto com os mesmos atributos
  const [existingExpenses] = await connection.execute(selectExpenseQuery, selectValues);
  if (existingExpenses.length > 0) {
    // Se já existir um gasto com os mesmos atributos, retorna uma mensagem informando que o gasto já foi inserido
    return { message: 'Este gasto já foi inserido anteriormente.' };
  }

  // Se não existir um gasto com os mesmos atributos, realiza a inserção
  const insertExpenseQuery = 'INSERT INTO Gastos_Comuns (data_gasto, detalhes, valor, tipo, parcela, total_parcelas, predio_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const insertValues = [data_gasto, detalhes, valorNumerico, tipo, parcela, total_parcelas, predio_id];

  try {
    const [result] = await connection.execute(insertExpenseQuery, insertValues);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir gasto comum:', error);
    throw error;
  }
};



const getCommonExpense = async (id) => {
  const query = 'SELECT * FROM Gastos_Comuns WHERE ID = ?';
  const [expenses] = await connection.execute(query, [id]);

  if (expenses.length > 0) {
    return expenses[0];
  } else {
    return null;
  }
};

const updateCommonExpense = async (id, expense) => {
  const { data_gasto, detalhes, valor, tipo, parcela, total_parcelas, predio_id } = expense;

  const getExpenseQuery = 'SELECT * FROM Gastos_Comuns WHERE ID = ?';
  const [existingExpenses] = await connection.execute(getExpenseQuery, [id]);

  if (existingExpenses.length === 0) {
    throw new Error('Gasto comum não encontrado.');
  }

  const updateExpenseQuery = `
    UPDATE Gastos_Comuns 
    SET data_gasto = ?, detalhes = ?, valor = ?, tipo = ?, parcela = ?, total_parcelas = ?, predio_id = ?
    WHERE ID = ?
  `;

  const values = [data_gasto, detalhes, valor, tipo, parcela, total_parcelas, predio_id, id];

  try {
    await connection.execute(updateExpenseQuery, values);
    return { message: 'Gasto comum atualizado com sucesso.' };
  } catch (error) {
    console.error('Erro ao atualizar gasto comum:', error);
    throw error;
  }
};

const deleteCommonExpense = async (id) => {
  const getExpenseQuery = 'SELECT * FROM Gastos_Comuns WHERE ID = ?';
  const [existingExpenses] = await connection.execute(getExpenseQuery, [id]);

  if (existingExpenses.length === 0) {
    return null;
  }

  const deleteExpenseQuery = 'DELETE FROM Gastos_Comuns WHERE ID = ?';
  try {
    await connection.execute(deleteExpenseQuery, [id]);
    return true;
  } catch (error) {
    console.error('Erro ao excluir gasto comum:', error);
    throw error;
  }
};

const getExpensesByBuildingAndMonth = async (predio_id, month, year) => {
  const query = `
    SELECT * FROM Gastos_Comuns
    WHERE predio_id = ? 
    AND YEAR(data_gasto) = ?
    AND MONTH(data_gasto) = ?;
  `;
  try {
    const [expenses] = await connection.execute(query, [predio_id, year, month]);
    return expenses;
  } catch (error) {
    console.error('Erro ao buscar gastos por prédio e mês:', error);
    throw error;
  }
};



module.exports = {
  getAllCommonExpenses,
  createCommonExpense,
  getCommonExpense,
  updateCommonExpense,
  deleteCommonExpense,
  getExpensesByBuildingAndMonth
};
