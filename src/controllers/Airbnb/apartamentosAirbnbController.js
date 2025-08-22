const apartamentoModel = require('../../models/Airbnb/apartamentosAirbnbModel');

const getAllApartamentos = async (request, response) => {
  try {
    const { empresaId } = request;
    const apartamentos = await apartamentoModel.getAllApartamentosByEmpresa(empresaId);
    return response.status(200).json(apartamentos);
  } catch (error) {
    console.error('Erro ao obter apartamentos:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamentos' });
  }
};

const createApartamento = async (request, response) => {
  try {
    const { empresaId } = request;
    const createdApartamento = await apartamentoModel.createApartamento({ ...request.body, empresa_id: empresaId });
    return response.status(201).json(createdApartamento);
  } catch (error) {
    console.error('Erro ao criar apartamento:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getApartamentoById = async (request, response) => {
  try {
    const { id } = request.params;
    const { empresaId } = request;
    const apartamento = await apartamentoModel.getApartamentoByIdAndEmpresa(id, empresaId);

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
    const { cod } = request.params;
    const apartamento = await apartamentoModel.getApartamentoByCodProprietario(cod);
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
    const { empresaId } = request;
    const apartamentos = await apartamentoModel.getApartamentosByPredioIdAndEmpresa(predioId, empresaId);
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