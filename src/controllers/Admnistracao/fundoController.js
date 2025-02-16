const fundosModel = require('../../models/Administracao/fundoModel');

const getAllFundos = async (request, response) => {
  try {
    const fundos = await fundosModel.getAllFundos();
    return response.status(200).json(fundos);
  } catch (error) {
    console.error('Erro ao obter fundos:', error);
    return response.status(500).json({ error: 'Erro ao obter fundos' });
  }
};

const createFundo = async (request, response) => {
  try {
    const createdFundo = await fundosModel.createFundo(request.body);
    return response.status(201).json(createdFundo);
  } catch (error) {
    console.error('Erro ao criar fundo:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getFundoById = async (request, response) => {
  try {
    const { id } = request.params;
    const fundo = await fundosModel.getFundoById(id);

    if (fundo) {
      return response.status(200).json(fundo);
    } else {
      return response.status(404).json({ message: 'Fundo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter fundo:', error);
    return response.status(500).json({ error: 'Erro ao obter fundo' });
  }
};

const getFundosByBuildingId = async (request, response) => {
  try {
    const { predioId } = request.params;
    const fundos = await fundosModel.getFundosByBuildingId(predioId);
    return response.status(200).json(fundos);
  } catch (error) {
    console.error('Erro ao obter fundos por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter fundos por prédio' });
  }
};

const updateFundo = async (request, response) => {
  try {
    const { id } = request.params;
    const fundo = { ...request.body, id };

    const wasUpdated = await fundosModel.updateFundo(fundo);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Fundo atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Fundo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar fundo:', error);
    return response.status(500).json({ error: 'Erro ao atualizar fundo' });
  }
};

const deleteFundo = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await fundosModel.deleteFundo(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Fundo deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Fundo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar fundo:', error);
    return response.status(500).json({ error: 'Erro ao deletar fundo' });
  }
};

module.exports = {
  getAllFundos,
  createFundo,
  getFundoById,
  getFundosByBuildingId,
  updateFundo,
  deleteFundo
};
