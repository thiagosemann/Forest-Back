const connection = require('./connection');
const fs = require('fs'); // Usado para ler arquivos binários (se necessário)

// Obtém todos os documentos
const getAllNotasGastosComuns = async () => {
  const [documents] = await connection.execute('SELECT * FROM notasGastosComuns');
  return documents;
};

// Cria um novo documento
const createNotasGastosComuns = async (document) => {
  console.log(document)
  const { documentBlob, commonExpense_id } = document;

  const insertDocumentQuery = 'INSERT INTO notasGastosComuns (document, commonExpense_id) VALUES (?, ?)';
  const values = [documentBlob, commonExpense_id];

  try {
    const [result] = await connection.execute(insertDocumentQuery, values);
    return { id: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir documento:', error);
    throw error;
  }
};

// Obtém um documento pelo ID
const getNotasGastosComunsById = async (id) => {
  const query = 'SELECT * FROM notasGastosComuns WHERE id = ?';
  const [documents] = await connection.execute(query, [id]);

  if (documents.length > 0) {
    const document = documents[0];
    const bufferContent = document.document ? document.document.toString('utf8') : '';
    // Se o campo 'document' existir, converta o Buffer para Base64
    if (document.document) {
      document.document = bufferContent;
    }
    return document;
  } else {
    console.log('Nenhum documento encontrado com o ID:', id);
    return null;
  }
};

// Obtém documentos por commonExpense_id
const getNotasGastosComunsByCommonExpenseId = async (commonExpenseId) => {
  const query = 'SELECT * FROM notasGastosComuns WHERE commonExpense_id = ?';
  const [documents] = await connection.execute(query, [commonExpenseId]);
  return documents;
};

// Atualiza um documento
const updateNotasGastosComuns = async (document) => {
  const { id, documentBlob, commonExpense_id } = document;
  const updateDocumentQuery = `
    UPDATE notasGastosComuns 
    SET document = ?, commonExpense_id = ?
    WHERE id = ?
  `;
  const values = [documentBlob, commonExpense_id, id];

  try {
    const [result] = await connection.execute(updateDocumentQuery, values);
    return result.affectedRows > 0; // Retorna true se o documento foi atualizado com sucesso
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    throw error;
  }
};

// Deleta um documento pelo ID
const deleteNotasGastosComuns = async (id) => {
  const deleteDocumentQuery = 'DELETE FROM notasGastosComuns WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteDocumentQuery, [id]);
    return result.affectedRows > 0; // Retorna true se o documento foi deletado com sucesso
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    throw error;
  }
};

module.exports = {
  getAllNotasGastosComuns,
  createNotasGastosComuns,
  getNotasGastosComunsById,
  getNotasGastosComunsByCommonExpenseId,
  updateNotasGastosComuns,
  deleteNotasGastosComuns,
};
