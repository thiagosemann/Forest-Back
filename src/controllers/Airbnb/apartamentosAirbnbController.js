const apartamentoModel = require('../../models/Airbnb/apartamentosAirbnbModel');

const getAllApartamentos = async (request, response) => {
  try {
    const apartamentos = await apartamentoModel.getAllApartamentos();
    return response.status(200).json(apartamentos);
  } catch (error) {
    console.error('Erro ao obter apartamentos:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamentos' });
  }
};

const createApartamento = async (request, response) => {
  try {
    const createdApartamento = await apartamentoModel.createApartamento(request.body);
    return response.status(201).json(createdApartamento);
  } catch (error) {
    console.error('Erro ao criar apartamento:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getApartamentoById = async (request, response) => {
  try {
    const { id } = request.params;
    const apartamento = await apartamentoModel.getApartamentoById(id);

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

const getApartamentoByCodProprietario = async (request, response) => {
  try {
    const { cod_link_proprietario } = request.params;
    const apartamento = await apartamentoModel.getApartamentoByCodProprietario(cod_link_proprietario);

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

const getApartamentosByPredioId = async (request, response) => {
  try {
    const { predioId } = request.params;
    const apartamentos = await apartamentoModel.getApartamentosByPredioId(predioId);
    return response.status(200).json(apartamentos);
  } catch (error) {
    console.error('Erro ao obter apartamentos por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamentos por prédio' });
  }
};

const updateApartamento = async (request, response) => {
  try {
    const { id } = request.params;
    const apartamento = { ...request.body, id };

    const wasUpdated = await apartamentoModel.updateApartamento(apartamento);

    if (wasUpdated) {
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

    const wasDeleted = await apartamentoModel.deleteApartamento(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Apartamento deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar apartamento:', error);
    return response.status(500).json({ error: 'Erro ao deletar apartamento' });
  }
};


module.exports = {
  getAllApartamentos,
  createApartamento,
  getApartamentoById,
  getApartamentosByPredioId,
  getApartamentoByCodProprietario,
  updateApartamento,
  deleteApartamento
};