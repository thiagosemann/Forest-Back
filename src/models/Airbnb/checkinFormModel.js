// src/models/checkinModel.js

const connection = require('../connection2');
const usersModel = require('../Airbnb/usersAirbnbModel');

const getAllCheckins = async () => {
  const [checkins] = await connection.execute(
    `SELECT 
       c.*,                        -- inclui id, cod_reserva, CPF, tipo, reserva_id, horarioPrevistoChegada, created_at, updated_at
       u.first_name,
       u.last_name,
       u.Telefone,
       uf.imagemBase64,
       uf.documentBase64
     FROM checkin c
     LEFT JOIN users u       ON c.user_id = u.id
     LEFT JOIN user_files uf ON u.id    = uf.user_id`
  );
  return checkins;
};

const createCheckin = async (checkinData) => {
  const {
    CPF,
    Nome,
    Telefone,
    imagemBase64,
    tipo,
    documentBase64,
    cod_reserva,
    horarioPrevistoChegada
  } = checkinData;

  // 1) Busca a reserva pelo código
  const [reservas] = await connection.execute(
    'SELECT id FROM reservas WHERE cod_reserva = ?',
    [cod_reserva]
  );
  const reserva_id = reservas[0]?.id || null;

  // 2) Cria ou atualiza o usuário
  let user = await usersModel.getUserByCPF(CPF);
  if (user) {
    await usersModel.updateUser(user.id, {
      first_name: Nome,
      role: tipo,
      imagemBase64,
      documentBase64,
      Telefone
    });
  } else {
    const newUser = {
      first_name: Nome,
      last_name: '',
      cpf: CPF,
      email: null,
      password: null,
      role: tipo,
      imagemBase64,
      documentBase64,
      Telefone
    };
    const createdUser = await usersModel.createUser(newUser);
    user = { id: createdUser.insertId };
  }

  // 3) Verifica existência de check-in
  const [existingCheckins] = await connection.execute(
    'SELECT id FROM checkin WHERE cod_reserva = ? AND CPF = ?',
    [cod_reserva, CPF]
  );
  if (existingCheckins.length > 0) {
    const existingId = existingCheckins[0].id;
    await connection.execute(
      `UPDATE checkin
         SET tipo                  = ?,
             reserva_id            = ?,
             horarioPrevistoChegada = ?,
             user_id               = ?
       WHERE id = ?`,
      [tipo, reserva_id, horarioPrevistoChegada, user.id, existingId]
    );
    return {
      checkinId: existingId,
      updated: true,
      message: 'Check-in existente atualizado com sucesso.'
    };
  }

  // 4) Insere novo check-in
  const insertCheckinQuery = `
    INSERT INTO checkin
      (cod_reserva, CPF, tipo, reserva_id, user_id, horarioPrevistoChegada)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    cod_reserva,
    CPF,
    tipo,
    reserva_id,
    user.id,
    horarioPrevistoChegada
  ];

  try {
    const [result] = await connection.execute(insertCheckinQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Conflito: check-in já existe para este CPF e reserva.');
    }
    throw error;
  }
};

const getCheckinById = async (id) => {
  const [rows] = await connection.execute(
    `SELECT
       c.*,                      -- inclui created_at e updated_at
       u.first_name,
       u.last_name,
       u.Telefone,
       u.imagemBase64,
       u.documentBase64
     FROM checkin c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const getCheckinsByReservaId = async (reservaId) => {
  const [checkins] = await connection.execute(
    `SELECT
       c.*,                      -- inclui created_at e updated_at
       u.first_name,
       u.last_name,
       u.Telefone,
       u.imagemBase64,
       u.documentBase64
     FROM checkin c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.reserva_id = ?`,
    [reservaId]
  );
  return checkins;
};

const updateCheckin = async (checkin) => {
  const {
    id,
    cod_reserva,
    CPF,
    Nome,
    Telefone,
    imagemBase64,
    documentBase64,
    tipo,
    reserva_id,
    horarioPrevistoChegada
  } = checkin;

  // Atualiza dados do usuário
  const [orig] = await connection.execute(
    'SELECT user_id FROM checkin WHERE id = ?',
    [id]
  );
  const userId = orig[0].user_id;
  await usersModel.updateUser(userId, {
    first_name: Nome,
    Telefone,
    imagemBase64,
    documentBase64,
    role: tipo,
    cpf: CPF
  });

  // Atualiza colunas do check-in
  const [result] = await connection.execute(
    `UPDATE checkin
     SET cod_reserva            = ?,
         CPF                    = ?,
         tipo                   = ?,
         reserva_id             = ?,
         horarioPrevistoChegada = ?
     WHERE id = ?`,
    [cod_reserva, CPF, tipo, reserva_id, horarioPrevistoChegada, id]
  );

  return result.affectedRows > 0;
};

const deleteCheckin = async (id) => {
  const [result] = await connection.execute(
    'DELETE FROM checkin WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

const getCheckinByReservaIdOrCodReserva = async (reservaId, codReserva) => {
  const [byResId] = await connection.execute(
    `SELECT
       c.*,                      -- inclui created_at e updated_at
       u.first_name,
       u.last_name,
       u.Telefone,
       uf.imagemBase64,
       uf.documentBase64
     FROM checkin c
     LEFT JOIN users u       ON c.user_id = u.id
     LEFT JOIN user_files uf ON u.id    = uf.user_id
     WHERE c.reserva_id = ?`,
    [reservaId]
  );
  if (byResId.length) return byResId;

  const [byCod] = await connection.execute(
    `SELECT
       c.*,                      -- inclui created_at e updated_at
       u.first_name,
       u.last_name,
       u.Telefone,
       uf.imagemBase64,
       uf.documentBase64
     FROM checkin c
     LEFT JOIN users u       ON c.user_id = u.id
     LEFT JOIN user_files uf ON u.id    = uf.user_id
     WHERE c.cod_reserva = ?`,
    [codReserva]
  );
  return byCod.length ? byCod : null;
};

const getCheckinsByUserId = async (userId) => {
  const [checkins] = await connection.execute(
    `SELECT
       c.*,                      -- inclui created_at e updated_at
       r.apartamento_id,
       a.nome        AS apartamento_nome,
       u.first_name,
       u.last_name,
       u.Telefone,
       uf.imagemBase64,
       uf.documentBase64
     FROM checkin c
     LEFT JOIN reservas r     ON c.reserva_id   = r.id
     LEFT JOIN apartamentos a ON r.apartamento_id = a.id
     LEFT JOIN users u        ON c.user_id       = u.id
     LEFT JOIN user_files uf  ON u.id            = uf.user_id
     WHERE c.user_id = ?
     ORDER BY c.id ASC`,
    [userId]
  );
  return checkins;
};

module.exports = {
  getAllCheckins,
  createCheckin,
  getCheckinById,
  getCheckinsByReservaId,
  updateCheckin,
  deleteCheckin,
  getCheckinByReservaIdOrCodReserva,
  getCheckinsByUserId
};
