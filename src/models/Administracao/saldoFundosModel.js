const connection = require('../connection');

const getAllSaldoFundos = async () => {
  const [saldos] = await connection.execute('SELECT * FROM saldo_fundos');
  return saldos;
};

const createSaldoFundo = async (saldoFundo) => {
  const { fundo_id, saldo } = saldoFundo;
  const insertSaldoFundoQuery = 'INSERT INTO saldo_fundos (fundo_id, saldo) VALUES (?, ?)';
  const values = [fundo_id, saldo];

  try {
    const [result] = await connection.execute(insertSaldoFundoQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir saldo de fundo:', error);
    throw error;
  }
};

const getSaldoFundoById = async (id) => {
  const query = 'SELECT * FROM saldo_fundos WHERE id = ?';
  const [saldos] = await connection.execute(query, [id]);

  if (saldos.length > 0) {
    return saldos[0];
  } else {
    return null;
  }
};

const getSaldoFundosByFundoId = async (fundo_id) => {
  const query = 'SELECT * FROM saldo_fundos WHERE fundo_id = ?';
  const [saldos] = await connection.execute(query, [fundo_id]);
  return saldos;
};

const updateSaldoFundo = async (saldoFundo) => {
    const { fundo_id, saldo } = saldoFundo;
    const updateSaldoFundoQuery = `
      UPDATE saldo_fundos 
      SET saldo = ?
      WHERE fundo_id = ?
    `;
    const values = [saldo, fundo_id];
  
    try {
      const [result] = await connection.execute(updateSaldoFundoQuery, values);
      return result.affectedRows > 0; // Retorna true se o saldo foi atualizado com sucesso
    } catch (error) {
      console.error('Erro ao atualizar saldo de fundo:', error);
      throw error;
    }
  };
  

const deleteSaldoFundo = async (id) => {
  const deleteSaldoFundoQuery = 'DELETE FROM saldo_fundos WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteSaldoFundoQuery, [id]);
    return result.affectedRows > 0; // Retorna true se o saldo foi deletado com sucesso
  } catch (error) {
    console.error('Erro ao deletar saldo de fundo:', error);
    throw error;
  }
};

const getSaldoFundosByBuildingId = async (predio_id) => {
    const query = `
      SELECT f.id AS fundo_id, f.tipo_fundo, f.predio_id, sf.saldo AS saldo
      FROM fundos f
      LEFT JOIN saldo_fundos sf ON f.id = sf.fundo_id
      WHERE f.predio_id = ?;
    `;
  
    try {
      const [fundosComSaldo] = await connection.execute(query, [predio_id]);
      return fundosComSaldo;
    } catch (error) {
      console.error('Erro ao buscar saldos dos fundos por predio_id:', error);
      throw error;
    }
  };
  

module.exports = {
  getAllSaldoFundos,
  createSaldoFundo,
  getSaldoFundoById,
  getSaldoFundosByFundoId,
  updateSaldoFundo,
  deleteSaldoFundo,
  getSaldoFundosByBuildingId
};
