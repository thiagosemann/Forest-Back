const connection = require('../connection');

const getAllProvisoes = async () => {
  const [provisoes] = await connection.execute('SELECT * FROM provisoes');
  return provisoes;
};

const createProvisao = async (provisao) => {
  const { detalhe, predio_id, valor, frequencia } = provisao;
  const insertProvisaoQuery = 'INSERT INTO provisoes (detalhe, predio_id, valor, frequencia) VALUES (?, ?, ?, ?)';
  const values = [detalhe, predio_id, valor, frequencia];

  try {
    const [result] = await connection.execute(insertProvisaoQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir provisão:', error);
    throw error;
  }
};

const getProvisaoById = async (id) => {
  const query = 'SELECT * FROM provisoes WHERE id = ?';
  const [provisoes] = await connection.execute(query, [id]);

  if (provisoes.length > 0) {
    return provisoes[0];
  } else {
    return null;
  }
};

const getProvisoesByBuildingId = async (predioId) => {
  const query = 'SELECT * FROM provisoes WHERE predio_id = ?';
  const [provisoes] = await connection.execute(query, [predioId]);
  return provisoes;
};

const updateProvisao = async (provisao) => {
  const { id, detalhe, predio_id, valor, frequencia } = provisao;
  const updateProvisaoQuery = `
    UPDATE provisoes 
    SET detalhe = ?, predio_id = ?, valor = ?, frequencia = ?
    WHERE id = ?
  `;
  const values = [detalhe, predio_id, valor, frequencia, id];

  try {
    const [result] = await connection.execute(updateProvisaoQuery, values);
    return result.affectedRows > 0; // Retorna true se a provisão foi atualizada com sucesso
  } catch (error) {
    console.error('Erro ao atualizar provisão:', error);
    throw error;
  }
};

const deleteProvisao = async (id) => {
  const deleteProvisaoQuery = 'DELETE FROM provisoes WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteProvisaoQuery, [id]);
    return result.affectedRows > 0; // Retorna true se a provisão foi deletada com sucesso
  } catch (error) {
    console.error('Erro ao deletar provisão:', error);
    throw error;
  }
};

module.exports = {
  getAllProvisoes,
  createProvisao,
  getProvisaoById,
  getProvisoesByBuildingId,
  updateProvisao,
  deleteProvisao
};
