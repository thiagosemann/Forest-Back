const apartamentosModel = require('../../models/Administracao/apartamentoModel');

const getAllApartamentos = async (request, response) => {
  try {
    const apartamentos = await apartamentosModel.getAllApartamentos();
    return response.status(200).json(apartamentos);
  } catch (error) {
    console.error('Erro ao obter apartamentos:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamentos' });
  }
};

const createApartamento = async (request, response) => {
  try {
    const createdApartamento = await apartamentosModel.createApartamento(request.body);
    return response.status(201).json(createdApartamento);
  } catch (error) {
    console.error('Erro ao criar apartamento:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getApartamentoById = async (request, response) => {
  try {
    const { id } = request.params;
    const apartamento = await apartamentosModel.getApartamentoById(id);

    if (apartamento) {
      return response.status(200).json(apartamento);
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamento' });
  }
};

const getApartamentosByBuildingId = async (request, response) => {
  try {
    const { id } = request.params;
    const apartamento = await apartamentosModel.getApartamentosByBuildingId(id);

    if (apartamento) {
      return response.status(200).json(apartamento);
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamento' });
  }
};

const updateApartamento = async (request, response) => {
  try {
    const { id } = request.params;
    const updated = await apartamentosModel.updateApartamento(id, request.body);

    if (updated) {
      return response.status(200).json({ message: 'Apartamento atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar apartamento:', error);
    return response.status(500).json({ error: 'Erro ao atualizar apartamento' });
  }
};

const deleteApartamento = async (request, response) => {
  try {
    const { id } = request.params;
    const deleted = await apartamentosModel.deleteApartamento(id);

    if (deleted) {
      return response.status(200).json({ message: 'Apartamento deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar apartamento:', error);
    return response.status(500).json({ error: 'Erro ao deletar apartamento' });
  }
};

const createApartamentosBatch = async (request, response) => {
  try {
    const apartamentos = request.body; // Array de objetos com nome, bloco, predio_id, fracao
    const createdApartamentos = await apartamentosModel.createApartamentosBatch(apartamentos);
    return response
      .status(201)
      .json({ message: `${createdApartamentos.length} apartamentos criados com sucesso.` });
  } catch (error) {
    console.error('Erro ao criar apartamentos em lote:', error);
    return response.status(409).json({ error: error.message });
  }
};

module.exports = {
  getAllApartamentos,
  createApartamento,
  getApartamentoById,
  getApartamentosByBuildingId,
  updateApartamento,
  deleteApartamento,
  createApartamentosBatch
};
