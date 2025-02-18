const connection = require('../connection');
const fs = require('fs');

// Obtém todos os extratos PDF
const getAllExtratosPdf = async () => {
  const [extratos] = await connection.execute('SELECT * FROM extratopdf');
  return extratos;
};

// Cria um novo extrato PDF
const createExtratoPdf = async (extrato) => {
  const { documentoBuffer, tipo, predio_id, data_gasto } = extrato; // Adicionados tipo e predio_id
  const insertQuery = `
    INSERT INTO extratopdf 
      (documento, tipo, predio_id, data_gasto)
    VALUES (?, ?, ?, ?)
  `;
  
  try {
    const [result] = await connection.execute(insertQuery, 
      [documentoBuffer, tipo, predio_id, data_gasto] // Nova ordem
    );
    return { id: result.insertId };
  } catch (error) {
    console.error('Erro ao criar extrato PDF:', error);
    throw error;
  }
};

// Obtém extrato por ID
const getExtratoPdfById = async (id) => {
  const query = 'SELECT * FROM extratopdf WHERE id = ?';
  const [extratos] = await connection.execute(query, [id]);

  if (extratos.length > 0) {
    const extrato = extratos[0];
    // Convertendo o BLOB para string
    extrato.documento = extrato.documento ? extrato.documento.toString('utf8') : null;
    return extrato;
  }
  return null;
};

// Atualiza um extrato PDF
const updateExtratoPdf = async (extrato) => {
  const { id, documentoBuffer, tipo, predio_id, data_gasto } = extrato; // Adicionados tipo e predio_id
  const updateQuery = `
    UPDATE extratopdf 
    SET documento = ?, tipo = ?, predio_id = ?, data_gasto = ?
    WHERE id = ?
  `;
  
  try {
    const [result] = await connection.execute(updateQuery, 
      [documentoBuffer, tipo, predio_id, data_gasto, id] // Nova ordem
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar extrato PDF:', error);
    throw error;
  }
};

// Deleta um extrato PDF
const deleteExtratoPdf = async (id) => {
  const deleteQuery = 'DELETE FROM extratopdf WHERE id = ?';
  
  try {
    const [result] = await connection.execute(deleteQuery, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar extrato PDF:', error);
    throw error;
  }
};

// Obtém extratos por mês, ano e prédio
const getExtratosPdfByBuildingMonthYear = async (predio_id, month, year) => {
  const query = `
    SELECT * FROM extratopdf 
    WHERE 
      predio_id = ? AND
      MONTH(data_gasto) = ? AND 
      YEAR(data_gasto) = ?
  `;
  
  try {
    const [extratos] = await connection.execute(query, [predio_id, month, year]);
    return extratos.map(extrato => ({
      ...extrato,
      documento: extrato.documento ? extrato.documento.toString('utf8') : null
    }));
  } catch (error) {
    console.error('Erro ao buscar extratos por prédio, mês e ano:', error);
    throw error;
  }
};

module.exports = {
  getAllExtratosPdf,
  createExtratoPdf,
  getExtratoPdfById,
  updateExtratoPdf,
  deleteExtratoPdf,
  getExtratosPdfByBuildingMonthYear
};