const connection = require('../connection');

// Cria uma relação entre um usuário e um apartamento
const createUserApartamento = async (userId, apartamentoId) => {
  const insertQuery = 'INSERT INTO Users_Apartamentos (user_id, apartamento_id) VALUES (?, ?)';
  try {
    const [result] = await connection.execute(insertQuery, [userId, apartamentoId]);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao criar relação entre usuário e apartamento:', error);
    throw error;
  }
};

// Retorna todas as relações com informações dos usuários e apartamentos
const getAllUserApartamentos = async () => {
  const query = `
    SELECT ua.user_id, ua.apartamento_id, u.first_name, u.last_name, a.nome, a.bloco, a.fracao
    FROM Users_Apartamentos ua
    JOIN users u ON ua.user_id = u.id
    JOIN apartamentos a ON ua.apartamento_id = a.id
  `;
  try {
    const [relations] = await connection.execute(query);
    return relations;
  } catch (error) {
    console.error('Erro ao obter relações entre usuários e apartamentos:', error);
    throw error;
  }
};

// Retorna todos os apartamentos relacionados a um determinado usuário
const getApartamentosByUserId = async (userId) => {
  const query = `
    SELECT a.*
    FROM Users_Apartamentos ua
    JOIN apartamentos a ON ua.apartamento_id = a.id
    WHERE ua.user_id = ?
  `;
  try {
    const [apartamentos] = await connection.execute(query, [userId]);
    return apartamentos;
  } catch (error) {
    console.error('Erro ao obter apartamentos por usuário:', error);
    throw error;
  }
};

// Retorna todos os usuários relacionados a um determinado apartamento
const getUsersByApartamentoId = async (apartamentoId) => {
  const query = `
    SELECT u.*
    FROM Users_Apartamentos ua
    JOIN users u ON ua.user_id = u.id
    WHERE ua.apartamento_id = ?
  `;
  try {
    const [users] = await connection.execute(query, [apartamentoId]);
    return users;
  } catch (error) {
    console.error('Erro ao obter usuários por apartamento:', error);
    throw error;
  }
};

// Remove a relação entre um usuário e um apartamento
const deleteUserApartamento = async (userId, apartamentoId) => {
  const deleteQuery = 'DELETE FROM Users_Apartamentos WHERE user_id = ? AND apartamento_id = ?';
  try {
    const [result] = await connection.execute(deleteQuery, [userId, apartamentoId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar relação entre usuário e apartamento:', error);
    throw error;
  }
};

module.exports = {
  createUserApartamento,
  getAllUserApartamentos,
  getApartamentosByUserId,
  getUsersByApartamentoId,
  deleteUserApartamento
};
