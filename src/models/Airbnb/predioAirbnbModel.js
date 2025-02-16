const connection = require('../connection2');

// Função para buscar todos os prédios
const getAllPredios = async () => {
  const [predios] = await connection.execute('SELECT * FROM predios');
  return predios;
};

// Função para criar um novo prédio
const createPredio = async (predio) => {
  const { nome } = predio;
  const insertPredioQuery = 'INSERT INTO predios (nome) VALUES (?)';
  const values = [nome];

  try {
    const [result] = await connection.execute(insertPredioQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir prédio:', error);
    throw error;
  }
};

// Função para buscar um prédio pelo ID
const getPredioById = async (id) => {
  const query = 'SELECT * FROM predios WHERE id = ?';
  const [predios] = await connection.execute(query, [id]);

  if (predios.length > 0) {
    return predios[0];
  } else {
    return null;
  }
};

// Função para atualizar um prédio
const updatePredio = async (predio) => {
  const { id, nome } = predio;
  const updatePredioQuery = `
    UPDATE predios 
    SET nome = ?
    WHERE id = ?
  `;
  const values = [nome, id];

  try {
    const [result] = await connection.execute(updatePredioQuery, values);
    return result.affectedRows > 0; // Retorna true se o prédio foi atualizado com sucesso
  } catch (error) {
    console.error('Erro ao atualizar prédio:', error);
    throw error;
  }
};

// Função para deletar um prédio pelo ID
const deletePredio = async (id) => {
  const deletePredioQuery = 'DELETE FROM predios WHERE id = ?';

  try {
    const [result] = await connection.execute(deletePredioQuery, [id]);
    return result.affectedRows > 0; // Retorna true se o prédio foi deletado com sucesso
  } catch (error) {
    console.error('Erro ao deletar prédio:', error);
    throw error;
  }
};

module.exports = {
  getAllPredios,
  createPredio,
  getPredioById,
  updatePredio,
  deletePredio
};