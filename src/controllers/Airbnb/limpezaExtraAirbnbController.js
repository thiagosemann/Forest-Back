const limpezaExtraModel = require('../../models/Airbnb/limpezaExtraAirbnbModel');

const getAllLimpezasExtras = async (request, response) => {
  try {
    const limpezas = await limpezaExtraModel.getAllLimpezasExtras();
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras' });
  }
};

const getLimpezaExtraById = async (request, response) => {
  try {
    const { id } = request.params;
    const limpeza = await limpezaExtraModel.getLimpezaExtraById(id);

    if (limpeza) {
      return response.status(200).json(limpeza);
    } else {
      return response.status(404).json({ message: 'Limpeza extra não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao obter limpeza extra:', error);
    return response.status(500).json({ error: 'Erro ao obter limpeza extra' });
  }
};

const createLimpezaExtra = async (request, response) => {
  try {
    const created = await limpezaExtraModel.createLimpezaExtra(request.body);
    return response.status(201).json(created);
  } catch (error) {
    console.error('Erro ao criar limpeza extra:', error);
    return response.status(409).json({ error: error.message });
  }
};

const updateLimpezaExtra = async (request, response) => {
  try {
    const { id } = request.params;
    const limpeza = { ...request.body, id };

    const wasUpdated = await limpezaExtraModel.updateLimpezaExtra(limpeza);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Limpeza extra atualizada com sucesso' });
    } else {
      return response.status(404).json({ message: 'Limpeza extra não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar limpeza extra:', error);
    return response.status(500).json({ error: 'Erro ao atualizar limpeza extra' });
  }
};

const deleteLimpezaExtra = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await limpezaExtraModel.deleteLimpezaExtra(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Limpeza extra deletada com sucesso' });
    } else {
      return response.status(404).json({ message: 'Limpeza extra não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar limpeza extra:', error);
    return response.status(500).json({ error: 'Erro ao deletar limpeza extra' });
  }
};
const getLimpezasExtrasHoje = async (request, response) => {
  try {
    const limpezas = await limpezaExtraModel.getLimpezasExtrasHoje();
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras de hoje:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras de hoje' });
  }
};

const getLimpezasExtrasSemana = async (request, response) => {
  try {
    const limpezas = await limpezaExtraModel.getLimpezasExtrasSemana();
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras desta semana:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras desta semana' });
  }
};

const getLimpezasExtrasSemanaQueVem = async (request, response) => {
  try {
    const limpezas = await limpezaExtraModel.getLimpezasExtrasSemanaQueVem();
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras da semana que vem:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras da semana que vem' });
  }
};
 
const getLimpezasExtrasPorPeriodo = async (request, response) => {
  try {
    const { startDate, endDate } = request.query;
    if (!startDate || !endDate) {
      return response.status(400).json({ error: 'Informe startDate e endDate no formato YYYY-MM-DD' });
    }

    const limpezas = await limpezaExtraModel.getLimpezasExtrasPorPeriodo(startDate, endDate);
    return response.status(200).json(limpezas);
  } catch (error) {
    console.error('Erro ao obter limpezas extras por período:', error);
    return response.status(500).json({ error: 'Erro ao obter limpezas extras por período' });
  }
};

module.exports = {
  getAllLimpezasExtras,
  getLimpezaExtraById,
  createLimpezaExtra,
  updateLimpezaExtra,
  deleteLimpezaExtra,
  getLimpezasExtrasHoje,
  getLimpezasExtrasSemana,
  getLimpezasExtrasSemanaQueVem,
  getLimpezasExtrasPorPeriodo
};