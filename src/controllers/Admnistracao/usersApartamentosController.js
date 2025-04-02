const usersApartamentosModel = require('../../models/Administracao/usersApartamentosModel');

// Cria uma relação entre usuário e apartamento
const createUserApartamento = async (request, response) => {
  try {
    const { user_id, apartamento_id } = request.body;
    const result = await usersApartamentosModel.createUserApartamento(user_id, apartamento_id);
    return response.status(201).json(result);
  } catch (error) {
    console.error('Erro ao criar relação entre usuário e apartamento:', error);
    return response.status(500).json({ error: 'Erro ao criar relação entre usuário e apartamento' });
  }
};

// Retorna todas as relações entre usuários e apartamentos
const getAllUserApartamentos = async (request, response) => {
  try {
    const relations = await usersApartamentosModel.getAllUserApartamentos();
    return response.status(200).json(relations);
  } catch (error) {
    console.error('Erro ao obter relações entre usuários e apartamentos:', error);
    return response.status(500).json({ error: 'Erro ao obter relações entre usuários e apartamentos' });
  }
};

// Retorna todos os apartamentos associados a um usuário específico
const getApartamentosByUserId = async (request, response) => {
  try {
    const { userId } = request.params;
    const apartments = await usersApartamentosModel.getApartamentosByUserId(userId);
    return response.status(200).json(apartments);
  } catch (error) {
    console.error('Erro ao obter apartamentos por usuário:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamentos por usuário' });
  }
};

// Retorna todos os usuários associados a um apartamento específico
const getUsersByApartamentoId = async (request, response) => {
  try {
    const { apartamentoId } = request.params;
    const users = await usersApartamentosModel.getUsersByApartamentoId(apartamentoId);
    return response.status(200).json(users);
  } catch (error) {
    console.error('Erro ao obter usuários por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter usuários por apartamento' });
  }
};

// Remove a relação entre um usuário e um apartamento
const deleteUserApartamento = async (request, response) => {
  try {
    // Considerando que os parâmetros user_id e apartamento_id são passados via params
    const { user_id, apartamento_id } = request.params;
    const result = await usersApartamentosModel.deleteUserApartamento(user_id, apartamento_id);
    if (result) {
      return response.status(200).json({ message: 'Relação excluída com sucesso.' });
    } else {
      return response.status(404).json({ message: 'Relação não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao excluir relação entre usuário e apartamento:', error);
    return response.status(500).json({ error: 'Erro ao excluir relação entre usuário e apartamento' });
  }
};

module.exports = {
  createUserApartamento,
  getAllUserApartamentos,
  getApartamentosByUserId,
  getUsersByApartamentoId,
  deleteUserApartamento
};
