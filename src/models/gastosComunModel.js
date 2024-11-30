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
  console.log(expense);
  const {
    data_gasto,
    nome_original,
    valor,
    tipo,
    parcela,
    total_parcelas,
    predio_id,
    tipoGasto_id,
    tipo_Gasto_Extra,
  } = expense;

  const valorNumerico = parseFloat(valor);
  const tipoGastoId = tipoGasto_id || null; // Define como null se não informado

  let selectExpenseQuery;
  let selectValues;

  if (tipoGastoId === null) {
    selectExpenseQuery = `
      SELECT * FROM Gastos_Comuns 
      WHERE data_gasto = ? 
        AND nome_original = ? 
        AND valor = ? 
        AND tipo = ? 
        AND parcela = ? 
        AND total_parcelas = ? 
        AND predio_id = ? 
        AND tipoGasto_id IS NULL 
        AND tipo_Gasto_Extra = ?
    `;
    selectValues = [data_gasto, nome_original, valorNumerico, tipo, parcela, total_parcelas, predio_id, tipo_Gasto_Extra];
  } else {
    selectExpenseQuery = `
      SELECT * FROM Gastos_Comuns 
      WHERE data_gasto = ? 
        AND nome_original = ? 
        AND valor = ? 
        AND tipo = ? 
        AND parcela = ? 
        AND total_parcelas = ? 
        AND predio_id = ? 
        AND tipoGasto_id = ? 
        AND tipo_Gasto_Extra = ?
    `;
    selectValues = [data_gasto, nome_original, valorNumerico, tipo, parcela, total_parcelas, predio_id, tipoGastoId, tipo_Gasto_Extra];
  }

  const [existingExpenses] = await connection.execute(selectExpenseQuery, selectValues);
  if (existingExpenses.length > 0) {
    return { message: 'Este gasto já foi inserido anteriormente.' };
  }

  const insertExpenseQuery = `
    INSERT INTO Gastos_Comuns 
      (data_gasto, nome_original, valor, tipo, parcela, total_parcelas, predio_id, tipoGasto_id, tipo_Gasto_Extra) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const insertValues = [data_gasto, nome_original, valorNumerico, tipo, parcela, total_parcelas, predio_id, tipoGastoId, tipo_Gasto_Extra];

  try {
    const [result] = await connection.execute(insertExpenseQuery, insertValues);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir gasto comum:', error);
    throw error;
  }
};



const getCommonExpense = async (id) => {
  const query = 'SELECT * FROM Gastos_Comuns WHERE id = ?';
  const [expenses] = await connection.execute(query, [id]);

  if (expenses.length > 0) {
    return expenses[0];
  } else {
    return null;
  }
};

const updateCommonExpense = async (id, expense) => {
  const { data_gasto, nome_original, valor, tipo, parcela, total_parcelas, predio_id, tipoGasto_id, tipo_Gasto_Extra } = expense;

  const getExpenseQuery = 'SELECT * FROM Gastos_Comuns WHERE id = ?';
  const [existingExpenses] = await connection.execute(getExpenseQuery, [id]);

  if (existingExpenses.length === 0) {
    throw new Error('Gasto comum não encontrado.');
  }

  const updateExpenseQuery = `
    UPDATE Gastos_Comuns 
    SET data_gasto = ?, nome_original = ?, valor = ?, tipo = ?, parcela = ?, total_parcelas = ?, predio_id = ?, tipoGasto_id = ?, tipo_Gasto_Extra = ?
    WHERE id = ?
  `;

  const values = [data_gasto, nome_original, valor, tipo, parcela, total_parcelas, predio_id, tipoGasto_id, tipo_Gasto_Extra, id];

  try {
    await connection.execute(updateExpenseQuery, values);
    return { message: 'Gasto comum atualizado com sucesso.' };
  } catch (error) {
    console.error('Erro ao atualizar gasto comum:', error);
    throw error;
  }
};


const deleteCommonExpense = async (id) => {
  const getExpenseQuery = 'SELECT * FROM Gastos_Comuns WHERE id = ?';
  const [existingExpenses] = await connection.execute(getExpenseQuery, [id]);

  if (existingExpenses.length === 0) {
    return null;
  }

  const deleteExpenseQuery = 'DELETE FROM Gastos_Comuns WHERE id = ?';
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

const getProvisoesByBuilding = async (predio_id) => {
  const query = `
    SELECT * FROM Gastos_Comuns
    WHERE predio_id = ? 
    AND tipo = 'Provisão Utilizada'
  `;
  try {
    const [expenses] = await connection.execute(query, [predio_id]);
    return expenses;
  } catch (error) {
    console.error('Erro ao buscar gastos por prédio:', error);
    throw error;
  }
};




module.exports = {
  getAllCommonExpenses,
  createCommonExpense,
  getCommonExpense,
  updateCommonExpense,
  deleteCommonExpense,
  getExpensesByBuildingAndMonth,
  getProvisoesByBuilding
};
