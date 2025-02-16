const documentosModel = require('../../models/Administracao/notasGastosComunsModel');

const getAllNotasGastosComuns = async (request, response) => {
  try {
    const documents = await documentosModel.getAllNotasGastosComuns();
    return response.status(200).json(documents);
  } catch (error) {
    console.error('Erro ao obter documentos:', error);
    return response.status(500).json({ error: 'Erro ao obter documentos' });
  }
};

const createNotasGastosComuns = async (request, response) => {
  try {
    console.log(request.body);
    if (!request.body || !request.body.documentBlob) {
      return response.status(400).json({ error: 'Arquivo não fornecido' });
    }

    const documentBlob = request.body.documentBlob;
    const { commonExpense_id } = request.body;

    const createdDocument = await documentosModel.createNotasGastosComuns({ documentBlob, commonExpense_id });

    return response.status(201).json(createdDocument);
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getNotasGastosComunsById = async (request, response) => {
  try {
    const { id } = request.params;
    const document = await documentosModel.getNotasGastosComunsById(id);

    if (document) {
      return response.status(200).json(document);
    } else {
      return response.status(404).json({ message: 'Documento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter documento:', error);
    return response.status(500).json({ error: 'Erro ao obter documento' });
  }
};

const getNotasGastosComunsByCommonExpenseId = async (request, response) => {
  try {
    const { commonExpenseId } = request.params;
    const documents = await documentosModel.getNotasGastosComunsByCommonExpenseId(commonExpenseId);
    return response.status(200).json(documents);
  } catch (error) {
    console.error('Erro ao obter documentos por ID de gasto comum:', error);
    return response.status(500).json({ error: 'Erro ao obter documentos por gasto comum' });
  }
};

const updateNotasGastosComuns = async (request, response) => {
  try {
    const { id } = request.params;

    let documentBlob = null;
    if (request.files && request.files.documentBlob) {
      documentBlob = request.files.documentBlob.data;
    }

    const { commonExpense_id } = request.body;

    const document = { id, documentBlob, commonExpense_id };
    const wasUpdated = await documentosModel.updateNotasGastosComuns(document);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Documento atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Documento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    return response.status(500).json({ error: 'Erro ao atualizar documento' });
  }
};

const deleteNotasGastosComuns = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await documentosModel.deleteNotasGastosComuns(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Documento deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Documento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    return response.status(500).json({ error: 'Erro ao deletar documento' });
  }
};

const getNotasGastosComunsByBuildingAndMonth = async (request, response) => {
  try {
    const { predio_id, month, year } = request.params;
    if (!predio_id || !month || !year) {
      return response.status(400).json({ error: 'Parâmetros predio_id, month e year são obrigatórios' });
    }

    const documents = await documentosModel.getNotasGastosComunsByBuildingAndMonth(predio_id, month, year);

    if (documents && documents.length > 0) {
      return response.status(200).json(documents);
    } else {
      return response.status(404).json({ message: 'Nenhum documento encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter documentos por prédio e mês:', error);
    return response.status(500).json({ error: 'Erro ao obter documentos por prédio e mês' });
  }
};

module.exports = {
  getAllNotasGastosComuns,
  createNotasGastosComuns,
  getNotasGastosComunsById,
  getNotasGastosComunsByCommonExpenseId,
  updateNotasGastosComuns,
  deleteNotasGastosComuns,
  getNotasGastosComunsByBuildingAndMonth,
};
