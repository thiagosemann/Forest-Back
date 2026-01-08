const connection = require('../connection2');

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
    console.log(data)
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

  const values = [
    apartamento_id,
    user_id_responsavel,
    reserva_id || null,
    user_id_created,
    demanda,
    prazo,
    periodo,
    status || 'Pendente',
    type
  ];

  const [result] = await connection.execute(insertQuery, values);
  return { insertId: result.insertId };
};

// Update demanda by id (partial update)
const updateDemanda = async (id, data) => {
  // Always refresh updated_at in DB
  data.updated_at = new Date();

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
