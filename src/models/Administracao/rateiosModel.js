const connection = require('../connection');

const getAllRateios = async () => {
  const [rateios] = await connection.execute('SELECT * FROM rateios');
  return rateios;
};

const createRateio = async (rateio) => {
  const { mes, ano, predio_id } = rateio;
  const insertRateioQuery = 'INSERT INTO rateios (mes, ano, predio_id) VALUES (?, ?, ?)';
  const values = [mes, ano, predio_id];

  try {
    const [result] = await connection.execute(insertRateioQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir rateio:', error);
    throw error;
  }
};

const getRateioById = async (id) => {
  const query = 'SELECT * FROM rateios WHERE id = ?';
  const [rateios] = await connection.execute(query, [id]);

  return rateios.length > 0 ? rateios[0] : null;
};

const getRateiosByBuildingIdAndMonthAndYear = async (predioId, mes, ano) => {
  const query = 'SELECT * FROM rateios WHERE predio_id = ? AND mes = ? AND ano = ?';
  const [rateios] = await connection.execute(query, [predioId, mes, ano]);
  return rateios;
};

const updateRateio = async (rateio) => {
  const { id, mes, ano, predio_id } = rateio;
  const updateRateioQuery = `
    UPDATE rateios 
    SET mes = ?, ano = ?, predio_id = ?
    WHERE id = ?
  `;
  const values = [mes, ano, predio_id, id];

  try {
    const [result] = await connection.execute(updateRateioQuery, values);
    return result.affectedRows > 0; // Retorna true se o rateio foi atualizado com sucesso
  } catch (error) {
    console.error('Erro ao atualizar rateio:', error);
    throw error;
  }
};

const deleteRateio = async (id) => {
  const deleteRateioQuery = 'DELETE FROM rateios WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteRateioQuery, [id]);
    return result.affectedRows > 0; // Retorna true se o rateio foi deletado com sucesso
  } catch (error) {
    console.error('Erro ao deletar rateio:', error);
    throw error;
  }
};

module.exports = {
  getAllRateios,
  createRateio,
  getRateioById,
  getRateiosByBuildingIdAndMonthAndYear,
  updateRateio,
  deleteRateio,
};
