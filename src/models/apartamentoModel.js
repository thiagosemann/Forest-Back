const connection = require('./connection');

const getAllApartamentos = async () => {
  const [apartamentos] = await connection.execute('SELECT * FROM apartamentos');
  return apartamentos;
};

const createApartamento = async (apartamento) => {
  const { nome, bloco, predio_id, fracao } = apartamento;
  const insertApartamentoQuery = 'INSERT INTO apartamentos (nome, bloco, predio_id,fracao) VALUES (?, ?, ?, ?)';
  const values = [nome, bloco, predio_id, fracao];

  try {
    const [result] = await connection.execute(insertApartamentoQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir apartamento:', error);
    throw error;
  }
};

const getApartamentoById = async (id) => {
  const query = 'SELECT * FROM apartamentos WHERE ID = ?';
  const [apartamentos] = await connection.execute(query, [id]);

  if (apartamentos.length > 0) {
    return apartamentos[0];
  } else {
    return null;
  }
};

const getApartamentosByBuildingId = async (id) => {
  const query = 'SELECT * FROM apartamentos WHERE predio_id = ?';
  const [apartamentos] = await connection.execute(query, [id]);
  return apartamentos;
};

const updateApartamento = async (id, apartamento) => {
  const { nome, bloco, predio_id, fracao } = apartamento;
  const updateQuery = 'UPDATE apartamentos SET nome = ?, bloco = ?, predio_id = ?, fracao = ? WHERE id = ?';
  const values = [nome, bloco, predio_id,fracao, id];

  try {
    const [result] = await connection.execute(updateQuery, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar apartamento:', error);
    throw error;
  }
};

const deleteApartamento = async (id) => {
  const deleteQuery = 'DELETE FROM apartamentos WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteQuery, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar apartamento:', error);
    throw error;
  }
};

module.exports = {
  getAllApartamentos,
  createApartamento,
  getApartamentoById,
  getApartamentosByBuildingId,
  updateApartamento,
  deleteApartamento
};
