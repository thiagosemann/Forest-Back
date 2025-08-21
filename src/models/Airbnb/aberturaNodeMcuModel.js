const connection = require('../connection2');

// Buscar todos os registros de aberturas (com filtro de data)
const getAllAberturas = async (startDate, endDate) => {
  let query = `SELECT * FROM nodemcu_aberturas`;
  const params = [];
  if (startDate && endDate) {
    query += ' WHERE created_at BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  query += ' ORDER BY created_at DESC';
  const [rows] = await connection.execute(query, params);
  return rows;
};

// Buscar abertura por ID
const getAberturaById = async (id) => {
  const [rows] = await connection.execute(
    'SELECT * FROM nodemcu_aberturas WHERE id = ?', [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Buscar aberturas por idNodemcu (com filtro de data)
const getAberturasByNodemcu = async (idNodemcu, startDate, endDate) => {
  let query = 'SELECT * FROM nodemcu_aberturas WHERE idNodemcu = ?';
  const params = [idNodemcu];
  if (startDate && endDate) {
    query += ' AND created_at BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  query += ' ORDER BY created_at DESC';
  const [rows] = await connection.execute(query, params);
  return rows;
};

// Buscar aberturas por reserva_id (com filtro de data)
const getAberturasByReservaId = async (reserva_id, startDate, endDate) => {
  let query = 'SELECT * FROM nodemcu_aberturas WHERE reserva_id = ?';
  const params = [reserva_id];
  if (startDate && endDate) {
    query += ' AND created_at BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  query += ' ORDER BY created_at DESC';
  const [rows] = await connection.execute(query, params);
  return rows;
};

// Buscar aberturas por predio_id (com filtro de data)
const getAberturasByPredioId = async (predio_id, startDate, endDate) => {
  // Busca todos os idNodemcu vinculados ao predio_id
  const [nodemcus] = await connection.execute(
    'SELECT idNodemcu FROM nodemcu_predio WHERE predio_id = ?', [predio_id]
  );
  if (!nodemcus.length) return [];
  const ids = nodemcus.map(n => n.idNodemcu);
  // Busca todas as aberturas desses NodeMCUs
  const placeholders = ids.map(() => '?').join(',');
  let query = `SELECT * FROM nodemcu_aberturas WHERE idNodemcu IN (${placeholders})`;
  const params = [...ids];
  if (startDate && endDate) {
    query += ' AND created_at BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  query += ' ORDER BY created_at DESC';
  const [rows] = await connection.execute(query, params);
  return rows;
};

// Criar novo registro de abertura
const createAbertura = async ({ idNodemcu, nodemcu_predio_id, reserva_id, cod_reserva }) => {
  const insertQuery = `
    INSERT INTO nodemcu_aberturas (idNodemcu, fechaduras_predio_id, reserva_id, cod_reserva)
    VALUES (?, ?, ?, ?)
  `;
  try {
    const [result] = await connection.execute(insertQuery, [idNodemcu, nodemcu_predio_id, reserva_id, cod_reserva]);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir abertura NodeMCU:', error);
    throw error;
  }
};

// Deletar registro por ID
const deleteAbertura = async (id) => {
  try {
    const [result] = await connection.execute(
      'DELETE FROM nodemcu_aberturas WHERE id = ?', [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar abertura NodeMCU:', error);
    throw error;
  }
};

module.exports = {
  getAllAberturas,
  getAberturaById,
  getAberturasByNodemcu,
  getAberturasByReservaId,
  getAberturasByPredioId,
  createAbertura,
  deleteAbertura,
};
