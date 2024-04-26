const connection = require('./connection');

const getAllApartamentos = async () => {
  const [apartamentos] = await connection.execute('SELECT * FROM apartamentos');
  return apartamentos;
};

const createApartamento = async (apartamento) => {
  const { nome, bloco, predio_id } = apartamento;
  const insertApartamentoQuery = 'INSERT INTO apartamentos (nome, bloco, predio_id) VALUES (?, ?, ?)';
  const values = [nome, bloco, predio_id];

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

module.exports = {
  getAllApartamentos,
  createApartamento,
  getApartamentoById,
  getApartamentosByBuildingId
};
