const connection = require('../connection2');

const createCredencial = async ({ reserva_id, cod_reserva, arquivoBase64 }) => {
  const query = `
    INSERT INTO credenciais_reserva (reserva_id, cod_reserva, arquivoBase64)
    VALUES (?, ?, ?)
  `;
  const values = [reserva_id, cod_reserva, arquivoBase64];
  const [result] = await connection.execute(query, values);
  return { insertId: result.insertId };
};

const getById = async (id) => {
  const query = 'SELECT * FROM credenciais_reserva WHERE id = ?';
  const [rows] = await connection.execute(query, [id]);
  return rows[0] || null;
};

const getByReservaId = async (reserva_id) => {
  const query = 'SELECT * FROM credenciais_reserva WHERE reserva_id = ?';
  const [rows] = await connection.execute(query, [reserva_id]);
  return rows;
};

const getByCodReserva = async (cod_reserva) => {
  const query = 'SELECT * FROM credenciais_reserva WHERE cod_reserva = ?';
  const [rows] = await connection.execute(query, [cod_reserva]);
  return rows;
};

const deleteByReservaId = async (reserva_id) => {
  const query = 'DELETE FROM credenciais_reserva WHERE reserva_id = ?';
  const [result] = await connection.execute(query, [reserva_id]);
  return result.affectedRows > 0;
};

const deleteById = async (id) => {
  const query = 'DELETE FROM credenciais_reserva WHERE id = ?';
  const [result] = await connection.execute(query, [id]);
  return result.affectedRows > 0;
};

const getAll = async () => {
  const query = 'SELECT * FROM credenciais_reserva ORDER BY id DESC';
  const [rows] = await connection.execute(query);
  return rows;
};

module.exports = {
  createCredencial,
  getById,
  getByReservaId,
  getByCodReserva,
  deleteByReservaId,
  deleteById,
  getAll
};
