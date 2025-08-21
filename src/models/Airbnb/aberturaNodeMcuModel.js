const connection = require('../connection2');

// Buscar todos os registros de aberturas
const getAllAberturas = async () => {
  const [rows] = await connection.execute(
    `SELECT * FROM nodemcu_aberturas ORDER BY created_at DESC`
  );
  return rows;
};

// Buscar abertura por ID
const getAberturaById = async (id) => {
  const [rows] = await connection.execute(
    'SELECT * FROM nodemcu_aberturas WHERE id = ?', [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Buscar aberturas por idNodemcu
const getAberturasByNodemcu = async (idNodemcu) => {
  const [rows] = await connection.execute(
    'SELECT * FROM nodemcu_aberturas WHERE idNodemcu = ? ORDER BY created_at DESC', [idNodemcu]
  );
  return rows;
};

// Buscar aberturas por reserva_id
const getAberturasByReservaId = async (reserva_id) => {
  const [rows] = await connection.execute(
    'SELECT * FROM nodemcu_aberturas WHERE reserva_id = ? ORDER BY created_at DESC', [reserva_id]
  );
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
  createAbertura,
  deleteAbertura,
};
