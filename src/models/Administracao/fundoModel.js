const connection = require('../connection');

const getAllFundos = async () => {
  const [fundos] = await connection.execute('SELECT * FROM fundos');
  return fundos;
};

const createFundo = async (fundo) => {
  const { tipo_fundo, predio_id, porcentagem } = fundo;
  const insertFundoQuery = 'INSERT INTO fundos (tipo_fundo, predio_id, porcentagem) VALUES (?, ?, ?)';
  const values = [tipo_fundo, predio_id, porcentagem];

  try {
    const [result] = await connection.execute(insertFundoQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir fundo:', error);
    throw error;
  }
};

const getFundoById = async (id) => {
  const query = 'SELECT * FROM fundos WHERE id = ?';
  const [fundos] = await connection.execute(query, [id]);

  if (fundos.length > 0) {
    return fundos[0];
  } else {
    return null;
  }
};

const getFundosByBuildingId = async (predioId) => {
  const query = `
    SELECT f.*, sf.saldo
    FROM fundos f
    LEFT JOIN saldo_fundos sf ON f.id = sf.fundo_id
    WHERE f.predio_id = ?`;
  
  const [fundos] = await connection.execute(query, [predioId]);
  return fundos; // Retorna os fundos com seus saldos, se existirem
};


const updateFundo = async (fundo) => {
  const { id, tipo_fundo, predio_id, porcentagem } = fundo;
  const updateFundoQuery = `
    UPDATE fundos 
    SET tipo_fundo = ?, predio_id = ?, porcentagem = ?
    WHERE id = ?
  `;
  const values = [tipo_fundo, predio_id, porcentagem, id];

  try {
    const [result] = await connection.execute(updateFundoQuery, values);
    return result.affectedRows > 0; // Retorna true se o fundo foi atualizado com sucesso
  } catch (error) {
    console.error('Erro ao atualizar fundo:', error);
    throw error;
  }
};

const deleteFundo = async (id) => {
  const deleteFundoQuery = 'DELETE FROM fundos WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteFundoQuery, [id]);
    return result.affectedRows > 0; // Retorna true se o fundo foi deletado com sucesso
  } catch (error) {
    console.error('Erro ao deletar fundo:', error);
    throw error;
  }
};

module.exports = {
  getAllFundos,
  createFundo,
  getFundoById,
  getFundosByBuildingId,
  updateFundo,
  deleteFundo
};
