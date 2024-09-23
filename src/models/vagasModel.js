const connection = require('./connection');

const getAllVagas = async () => {
  const [vagas] = await connection.execute('SELECT * FROM vagas');
  return vagas;
};

const createVaga = async (vaga) => {
  const { nome, predio_id, apartamento_id,fracao } = vaga;
  const insertVagaQuery = 'INSERT INTO vagas (nome, predio_id, apartamento_id,fracao) VALUES (?, ?, ?,?)';
  const values = [nome, predio_id, apartamento_id,fracao];

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

const updateVaga = async (vaga) => {
  const { id, nome, predio_id, apartamento_id, fracao } = vaga;
  const updateVagaQuery = `
    UPDATE vagas 
    SET nome = ?, predio_id = ?, apartamento_id = ?, fracao = ?
    WHERE id = ?
  `;
  const values = [nome, predio_id, apartamento_id, fracao, id];

  try {
    const [result] = await connection.execute(updateVagaQuery, values);
    return result.affectedRows > 0; // Retorna true se a vaga foi atualizada com sucesso
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);
    throw error;
  }
};

// Função para deletar uma vaga pelo ID
const deleteVaga = async (id) => {
  const deleteVagaQuery = 'DELETE FROM vagas WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteVagaQuery, [id]);
    return result.affectedRows > 0; // Retorna true se a vaga foi deletada com sucesso
  } catch (error) {
    console.error('Erro ao deletar vaga:', error);
    throw error;
  }
};

module.exports = {
  getAllVagas,
  createVaga,
  getVagaById,
  getVagasByBuildingId,
  getVagasByApartamentId,
  updateVaga,
  deleteVaga
};
