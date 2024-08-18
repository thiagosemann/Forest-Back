const connection = require('./connection');

const getAllVagas = async () => {
  const [vagas] = await connection.execute('SELECT * FROM vagas');
  return vagas;
};

const createVaga = async (vaga) => {
  const { nome, predio_id, apartamento_id } = vaga;
  const insertVagaQuery = 'INSERT INTO vagas (nome, predio_id, apartamento_id) VALUES (?, ?, ?)';
  const values = [nome, predio_id, apartamento_id];

  try {
    const [result] = await connection.execute(insertVagaQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir vaga:', error);
    throw error;
  }
};

const getVagaById = async (id) => {
  const query = 'SELECT * FROM vagas WHERE id = ?';
  const [vagas] = await connection.execute(query, [id]);

  if (vagas.length > 0) {
    return vagas[0];
  } else {
    return null;
  }
};

const getVagasByBuildingId = async (id) => {
  const query = 'SELECT * FROM vagas WHERE predio_id = ?';
  const [vagas] = await connection.execute(query, [id]);
  return vagas;
};

const getVagasByApartamentId = async (apartamentoId) => {
  const query = 'SELECT * FROM vagas WHERE apartamento_id = ?';
  const [vagas] = await connection.execute(query, [apartamentoId]);
  return vagas;
};

module.exports = {
  getAllVagas,
  createVaga,
  getVagaById,
  getVagasByBuildingId,
  getVagasByApartamentId,
};
