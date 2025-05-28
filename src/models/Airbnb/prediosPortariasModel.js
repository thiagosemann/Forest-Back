const connection = require('../connection2');

// Listar todas as associações prédio-portaria
const getAllPredioPortaria = async () => {
  const [rows] = await connection.execute(
    'SELECT * FROM predio_portaria'
  );
  return rows;
};

// Listar portarias de um prédio
const getPortariasByPredio = async (predioId) => {
  const [rows] = await connection.execute(
    `
    SELECT p.*
    FROM portarias p
    JOIN predio_portaria pp
      ON pp.portaria_id = p.id
    WHERE pp.predio_id = ?
    `,
    [predioId]
  );
  return rows;
};

// Listar prédios de uma portaria
const getPrediosByPortaria = async (portariaId) => {
  const [rows] = await connection.execute(
    `
    SELECT b.*
    FROM predios b
    JOIN predio_portaria pp
      ON pp.predio_id = b.id
    WHERE pp.portaria_id = ?
    `,
    [portariaId]
  );
  return rows;
};

// Vincular portaria a prédio
const linkPortariaToPredio = async (portariaId, predioId) => {
  try {
    await connection.execute(
      'INSERT IGNORE INTO predio_portaria (predio_id, portaria_id) VALUES (?, ?)',
      [predioId, portariaId]
    );
    return true;
  } catch (error) {
    console.error('Erro ao vincular portaria ao prédio:', error);
    throw error;
  }
};

// Remover vínculo entre portaria e prédio
const unlinkPortariaFromPredio = async (portariaId, predioId) => {
  try {
    const [result] = await connection.execute(
      'DELETE FROM predio_portaria WHERE predio_id = ? AND portaria_id = ?',
      [predioId, portariaId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao remover vínculo portaria-prédio:', error);
    throw error;
  }
};

module.exports = {
  getAllPredioPortaria,
  getPortariasByPredio,
  getPrediosByPortaria,
  linkPortariaToPredio,
  unlinkPortariaFromPredio
};
