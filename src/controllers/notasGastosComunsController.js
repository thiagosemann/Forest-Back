const documentosModel = require('../models/notasGastosComunsModel');

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
    console.log(request.body)
    // Verifica se o arquivo foi enviado
    if (!request.body || !request.body.documentBlob) {
      return response.status(400).json({ error: 'Arquivo não fornecido' });
    }

    const documentBlob = request.body.documentBlob;  // Obtém os dados binários do arquivo
    const { commonExpense_id } = request.body;

    // Criação do documento com o arquivo binário
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

    // Verifica se o arquivo foi enviado
    let documentBlob = null;
    if (request.files && request.files.documentBlob) {
      documentBlob = request.files.documentBlob.data;  // Obtém os dados binários do arquivo
    }

    const { commonExpense_id } = request.body;

    // Atualização do documento com ou sem arquivo binário
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

module.exports = {
  getAllNotasGastosComuns,
  createNotasGastosComuns,
  getNotasGastosComunsById,
  getNotasGastosComunsByCommonExpenseId,
  updateNotasGastosComuns,
  deleteNotasGastosComuns
};
