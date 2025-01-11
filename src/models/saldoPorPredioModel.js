const connection = require('./connection');

const getAllSaldos = async () => {
  const [saldos] = await connection.execute('SELECT * FROM saldos_por_predio');
  return saldos;
};

const createSaldo = async (saldo) => {
  const { predio_id, valor, data, type } = saldo;  // Incluindo o type
  const insertSaldoQuery = 'INSERT INTO saldos_por_predio (predio_id, valor, data, type) VALUES (?, ?, ?, ?)';
  const values = [predio_id, valor, data, type];  // Incluindo o type nos valores

  try {
    const [result] = await connection.execute(insertSaldoQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir saldo:', error);
    throw error;
  }
};

const getSaldoById = async (id) => {
  const query = 'SELECT * FROM saldos_por_predio WHERE id = ?';
  const [saldos] = await connection.execute(query, [id]);

  if (saldos.length > 0) {
    return saldos[0];
  } else {
    return null;
  }
};

const getSaldosByBuildingId = async (predioId) => {
  const query = 'SELECT * FROM saldos_por_predio WHERE predio_id = ?';
  const [saldos] = await connection.execute(query, [predioId]);
  return saldos;
};

const updateSaldo = async (saldo) => {
  const { id, predio_id, valor, data, type } = saldo;  // Incluindo o type
  const updateSaldoQuery = `
    UPDATE saldos_por_predio 
    SET predio_id = ?, valor = ?, data = ?, type = ?
    WHERE id = ?
  `;
  const values = [predio_id, valor, data, type, id];  // Incluindo o type nos valores

  try {
    const [result] = await connection.execute(updateSaldoQuery, values);
    return result.affectedRows > 0; // Retorna true se o saldo foi atualizado com sucesso
  } catch (error) {
    console.error('Erro ao atualizar saldo:', error);
    throw error;
  }
};

const deleteSaldo = async (id) => {
  const deleteSaldoQuery = 'DELETE FROM saldos_por_predio WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteSaldoQuery, [id]);
    return result.affectedRows > 0; // Retorna true se o saldo foi deletado com sucesso
  } catch (error) {
    console.error('Erro ao deletar saldo:', error);
    throw error;
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
