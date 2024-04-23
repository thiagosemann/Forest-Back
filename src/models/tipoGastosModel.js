const connection = require('./connection');

const getAllExpenseTypes = async () => {
  const [expenseTypes] = await connection.execute('SELECT * FROM tipo_Gasto');
  return expenseTypes;
};

const createExpenseType = async (expenseType) => {
  const { detalhes } = expenseType;
  const insertExpenseTypeQuery = 'INSERT INTO tipo_Gasto (detalhes) VALUES (?)';
  const values = [detalhes];

  try {
    const [result] = await connection.execute(insertExpenseTypeQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir tipo de gasto:', error);
    throw error;
  }
};

const getExpenseType = async (id) => {
  const query = 'SELECT * FROM tipo_Gasto WHERE id = ?';
  const [expenseTypes] = await connection.execute(query, [id]);

  if (expenseTypes.length > 0) {
    return expenseTypes[0];
  } else {
    return null;
  }
};

const updateExpenseType = async (id, expenseType) => {
  const { detalhes } = expenseType;

  const getExpenseTypeQuery = 'SELECT * FROM tipo_Gasto WHERE id = ?';
  const [existingExpenseTypes] = await connection.execute(getExpenseTypeQuery, [id]);

  if (existingExpenseTypes.length === 0) {
    throw new Error('Tipo de gasto não encontrado.');
  }

  const updateExpenseTypeQuery = 'UPDATE tipo_Gasto SET detalhes = ? WHERE id = ?';
  const values = [detalhes, id];

  try {
    await connection.execute(updateExpenseTypeQuery, values);
    return { message: 'Tipo de gasto atualizado com sucesso.' };
  } catch (error) {
    console.error('Erro ao atualizar tipo de gasto:', error);
    throw error;
  }
};

const deleteExpenseType = async (id) => {
  // Check if the expense type exists
  const getExpenseTypeQuery = 'SELECT * FROM tipo_Gasto WHERE id = ?';
  const [existingExpenseTypes] = await connection.execute(getExpenseTypeQuery, [id]);

  if (existingExpenseTypes.length === 0) {
    return null; // Return null if the expense type doesn't exist
  }

  // Delete the expense type
  const deleteExpenseTypeQuery = 'DELETE FROM tipo_Gasto WHERE id = ?';
  try {
    await connection.execute(deleteExpenseTypeQuery, [id]);
    return true; // Return true if the expense type was deleted successfully
  } catch (error) {
    console.error('Erro ao excluir tipo de gasto:', error);
    throw error;
  }
};

module.exports = {
  getAllExpenseTypes,
  createExpenseType,
  getExpenseType,
  updateExpenseType,
  deleteExpenseType
};
