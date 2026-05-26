const connection = require('../connection2');

const getAll = async (empresaId) => {
  let query = `
    SELECT
      d.id,
      d.user_id,
      d.empresa_id,
      d.dia_semana,
      d.max_limpezas_dia,
      d.created_at,
      d.updated_at,
      CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS terceirizado_nome
    FROM tercerizado_disponibilidade d
    LEFT JOIN users u ON u.id = d.user_id`;
  const params = [];
  if (empresaId) {
    query += ' WHERE d.empresa_id = ?';
    params.push(empresaId);
  }
  query += ' ORDER BY d.user_id, d.dia_semana';
  const [rows] = await connection.execute(query, params);
  return rows;
};

const getById = async (id, empresaId) => {
  let query = `
    SELECT
      d.id,
      d.user_id,
      d.empresa_id,
      d.dia_semana,
      d.max_limpezas_dia,
      d.created_at,
      d.updated_at,
      CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS terceirizado_nome
    FROM tercerizado_disponibilidade d
    LEFT JOIN users u ON u.id = d.user_id
    WHERE d.id = ?`;
  const params = [id];
  if (empresaId) {
    query += ' AND d.empresa_id = ?';
    params.push(empresaId);
  }
  const [rows] = await connection.execute(query, params);
  return rows[0] || null;
};

const getByUserId = async (userId, empresaId) => {
  let query = `
    SELECT
      d.id,
      d.user_id,
      d.empresa_id,
      d.dia_semana,
      d.max_limpezas_dia,
      d.created_at,
      d.updated_at,
      CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS terceirizado_nome
    FROM tercerizado_disponibilidade d
    LEFT JOIN users u ON u.id = d.user_id
    WHERE d.user_id = ?`;
  const params = [userId];
  if (empresaId) {
    query += ' AND d.empresa_id = ?';
    params.push(empresaId);
  }
  query += ' ORDER BY d.dia_semana';
  const [rows] = await connection.execute(query, params);
  return rows;
};

const getRawById = async (id) => {
  const [rows] = await connection.execute(
    'SELECT id, user_id, empresa_id, dia_semana, max_limpezas_dia FROM tercerizado_disponibilidade WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const { user_id, empresa_id, dia_semana, max_limpezas_dia = 1 } = data || {};

  if (!user_id) throw new Error('user_id é obrigatório.');
  if (!empresa_id) throw new Error('empresa_id é obrigatório.');
  if (dia_semana === undefined || dia_semana === null) throw new Error('dia_semana é obrigatório.');

  const dia = Number(dia_semana);
  if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
    throw new Error('dia_semana deve ser um inteiro entre 0 (domingo) e 6 (sábado).');
  }

  const max = Number(max_limpezas_dia);
  if (!Number.isInteger(max) || max < 1) {
    throw new Error('max_limpezas_dia deve ser um inteiro maior que 0.');
  }

  const [result] = await connection.execute(
    'INSERT INTO tercerizado_disponibilidade (user_id, empresa_id, dia_semana, max_limpezas_dia) VALUES (?, ?, ?, ?)',
    [user_id, empresa_id, dia, max]
  );
  return { insertId: result.insertId };
};

const update = async (id, data) => {
  const existing = await getRawById(id);
  if (!existing) throw new Error('Disponibilidade não encontrada.');

  const merged = { ...existing, ...(data || {}) };
  const { user_id, empresa_id, dia_semana, max_limpezas_dia } = merged;

  const dia = Number(dia_semana);
  if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
    throw new Error('dia_semana deve ser um inteiro entre 0 (domingo) e 6 (sábado).');
  }

  const max = Number(max_limpezas_dia);
  if (!Number.isInteger(max) || max < 1) {
    throw new Error('max_limpezas_dia deve ser um inteiro maior que 0.');
  }

  const [result] = await connection.execute(
    `UPDATE tercerizado_disponibilidade SET
      user_id = ?, empresa_id = ?, dia_semana = ?, max_limpezas_dia = ?, updated_at = NOW()
     WHERE id = ?`,
    [user_id, empresa_id, dia, max, id]
  );
  return result.affectedRows > 0;
};

const remove = async (id) => {
  const [result] = await connection.execute(
    'DELETE FROM tercerizado_disponibilidade WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  getByUserId,
  create,
  update,
  remove,
};
