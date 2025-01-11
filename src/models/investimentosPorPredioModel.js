const connection = require('./connection');

const getAllInvestimentos = async () => {
  const [investimentos] = await connection.execute('SELECT * FROM investimentos_por_predio');
  return investimentos;
};

const createInvestimento = async (investimento) => {
  const { predio_id, valor, data } = investimento;
  const insertInvestimentoQuery = 'INSERT INTO investimentos_por_predio (predio_id, valor, data) VALUES (?, ?, ?)';
  const values = [predio_id, valor, data];

  try {
    const [result] = await connection.execute(insertInvestimentoQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir investimento:', error);
    throw error;
  }
};

const getInvestimentoById = async (id) => {
  const query = 'SELECT * FROM investimentos_por_predio WHERE id = ?';
  const [investimentos] = await connection.execute(query, [id]);

  if (investimentos.length > 0) {
    return investimentos[0];
  } else {
    return null;
  }
};

const getInvestimentosByBuildingId = async (predioId) => {
  const query = 'SELECT * FROM investimentos_por_predio WHERE predio_id = ?';
  const [investimentos] = await connection.execute(query, [predioId]);
  return investimentos;
};

const updateInvestimento = async (investimento) => {
  const { id, predio_id, valor, data } = investimento;
  const updateInvestimentoQuery = `
    UPDATE investimentos_por_predio 
    SET predio_id = ?, valor = ?, data = ?
    WHERE id = ?
  `;
  const values = [predio_id, valor, data, id];

  try {
    const [result] = await connection.execute(updateInvestimentoQuery, values);
    return result.affectedRows > 0; // Retorna true se o investimento foi atualizado com sucesso
  } catch (error) {
    console.error('Erro ao atualizar investimento:', error);
    throw error;
  }
};

const deleteInvestimento = async (id) => {
  const deleteInvestimentoQuery = 'DELETE FROM investimentos_por_predio WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteInvestimentoQuery, [id]);
    return result.affectedRows > 0; // Retorna true se o investimento foi deletado com sucesso
  } catch (error) {
    console.error('Erro ao deletar investimento:', error);
    throw error;
  }
};

module.exports = {
  getAllInvestimentos,
  createInvestimento,
  getInvestimentoById,
  getInvestimentosByBuildingId,
  updateInvestimento,
  deleteInvestimento
};
