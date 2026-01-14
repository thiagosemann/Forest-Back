const connection = require('../connection2');

// Normalize ISO/string date to YYYY-MM-DD for DATE columns
const normalizeDate = (value) => {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') {
    // Accept already-normalized date
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }
  return value;
};

// Normalize enums to DB-safe values
const normalizePeriodo = (periodo) => {
  if (!periodo) return periodo;
  const map = { manha: 'manha', 'manhã': 'manha', tarde: 'tarde', noite: 'noite', madrugada: 'madrugada' };
  return map[periodo] || periodo;
};

const normalizeType = (type) => {
  if (!type) return type;
  const val = type.toLowerCase();
  if (val === 'rua' || val === 'escritorio') return val;
  return type; // mantém para validação posterior
};

const ensureAllowedValue = (value, allowed, fieldName) => {
  if (value === undefined || value === null) return value;
  if (!allowed.includes(value)) {
    throw new Error(`${fieldName} inválido. Use: ${allowed.join(', ')}`);
  }
  return value;
};

// Fetch all demandas with apartment name
const getAllDemandas = async () => {
  const [rows] = await connection.execute(
    `SELECT d.*, a.nome AS apartamento_nome
     FROM demandas d
     LEFT JOIN apartamentos a ON d.apartamento_id = a.id
     ORDER BY d.created_at DESC`
  );
  return rows;
};

// Fetch single demanda by id with apartment name
const getDemandaById = async (id) => {
  const [rows] = await connection.execute(
    `SELECT d.*, a.nome AS apartamento_nome
     FROM demandas d
     LEFT JOIN apartamentos a ON d.apartamento_id = a.id
     WHERE d.id = ?`,
    [id]
  );
  return rows.length ? rows[0] : null;
};

// Create new demanda
const createDemanda = async (data) => {
  const {
    apartamento_id,
    user_id_responsavel,
    reserva_id,
    user_id_created,
    demanda,
    prazo,
    periodo,
    status,
    type
  } = data;

  const insertQuery = `
    INSERT INTO demandas (
      apartamento_id,
      user_id_responsavel,
      reserva_id,
      user_id_created,
      demanda,
      prazo,
      periodo,
      status,
      type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const normPeriodo = normalizePeriodo(periodo);
  const normType = normalizeType(type);
  ensureAllowedValue(normPeriodo, ['manha', 'tarde', 'noite', 'madrugada'], 'periodo');
  ensureAllowedValue(normType, ['rua', 'escritorio'], 'type');

  const values = [
    apartamento_id || null,
    user_id_responsavel,
    reserva_id || null,
    user_id_created,
    demanda,
    normalizeDate(prazo),
    normPeriodo,
    status || 'Pendente',
    normType
  ];

  const [result] = await connection.execute(insertQuery, values);
  return { insertId: result.insertId };
};

// Update demanda by id (partial update)
const updateDemanda = async (id, data) => {
  // Always refresh updated_at in DB
  data.updated_at = new Date();

  // Prevent accidental id override
  if ('id' in data) delete data.id;

  // Normalize date/enums when present
  if (data.prazo !== undefined && data.prazo !== null) data.prazo = normalizeDate(data.prazo);
  if (data.periodo !== undefined && data.periodo !== null) {
    data.periodo = normalizePeriodo(data.periodo);
    ensureAllowedValue(data.periodo, ['manha', 'tarde', 'noite', 'madrugada'], 'periodo');
  }
  if (data.type !== undefined && data.type !== null) {
    data.type = normalizeType(data.type);
    ensureAllowedValue(data.type, ['rua', 'escritorio'], 'type');
  }

  // Avoid setting apartamento_id to null when not provided
  if (data.apartamento_id === null || data.apartamento_id === undefined) delete data.apartamento_id;

  const fields = [];
  const values = [];
  for (const [key, val] of Object.entries(data)) {
    if (key === 'created_at') continue;
    fields.push(`\`${key}\` = ?`);
    values.push(val);
  }
  if (!fields.length) return { message: 'Nada para atualizar.' };

  const sql = `UPDATE demandas SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);
  await connection.execute(sql, values);
  return { message: 'Demanda atualizada com sucesso.' };
};

// Delete demanda
const deleteDemanda = async (id) => {
  const [result] = await connection.execute('DELETE FROM demandas WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// List by user responsible
const getDemandasByResponsavel = async (userId) => {
  const [rows] = await connection.execute(
    `SELECT d.*, a.nome AS apartamento_nome
     FROM demandas d
     LEFT JOIN apartamentos a ON d.apartamento_id = a.id
     WHERE d.user_id_responsavel = ?
     ORDER BY d.created_at DESC`,
    [userId]
  );
  return rows;
};

// List by user who created
const getDemandasByUserCreated = async (userId) => {
  const [rows] = await connection.execute(
    `SELECT d.*, a.nome AS apartamento_nome
     FROM demandas d
     LEFT JOIN apartamentos a ON d.apartamento_id = a.id
     WHERE d.user_id_created = ?
     ORDER BY d.created_at DESC`,
    [userId]
  );
  return rows;
};

// List by prazo (exact date YYYY-MM-DD)
const getDemandasByPrazo = async (prazo) => {
  const [rows] = await connection.execute(
    `SELECT d.*, a.nome AS apartamento_nome
     FROM demandas d
     LEFT JOIN apartamentos a ON d.apartamento_id = a.id
     WHERE d.prazo = ?
     ORDER BY d.prazo ASC, d.created_at DESC`,
    [prazo]
  );
  return rows;
};

// List by status
const getDemandasByStatus = async (status) => {
  const [rows] = await connection.execute(
    `SELECT d.*, a.nome AS apartamento_nome
     FROM demandas d
     LEFT JOIN apartamentos a ON d.apartamento_id = a.id
     WHERE d.status = ?
     ORDER BY d.created_at DESC`,
    [status]
  );
  return rows;
};

module.exports = {
  getAllDemandas,
  getDemandaById,
  createDemanda,
  updateDemanda,
  deleteDemanda,
  getDemandasByResponsavel,
  getDemandasByUserCreated,
  getDemandasByPrazo,
  getDemandasByStatus,
};
