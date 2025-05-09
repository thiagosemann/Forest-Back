const connection = require('../connection2');
const usersModel = require('../Airbnb/usersAirbnbModel')

const getAllCheckins = async () => {
  const [checkins] = await connection.execute(
    `SELECT 
       c.*,
       u.first_name,
       u.last_name,
       u.Telefone,
       uf.imagemBase64,
       uf.documentBase64
     FROM checkin c
     LEFT JOIN users u    ON c.user_id = u.id
     LEFT JOIN user_files uf ON u.id = uf.user_id`
  );
  return checkins;
};

const createCheckin = async (checkinData) => {
  const { CPF, Nome, Telefone, imagemBase64, tipo, documentBase64, cod_reserva } = checkinData;

  // 1. Busca a reserva pelo código
  const [reservas] = await connection.execute(
    'SELECT id FROM reservas WHERE cod_reserva = ?', 
    [cod_reserva]
  );
  const reserva_id = reservas[0]?.id || null;

  // 2. Cria/Atualiza o usuário (independente do check-in existir ou não)
  let user = await usersModel.getUserByCPF(CPF);

  if (user) {
    // Atualiza o usuário existente mesmo se check-in já existir
    const updatedUserData = {
      first_name: Nome,
      role: tipo,
      imagemBase64: imagemBase64,
      documentBase64: documentBase64,
      Telefone: Telefone
    };
    await usersModel.updateUser(user.id, updatedUserData);
  } else {
    // Cria novo usuário se não existir
    const newUser = {
      first_name: Nome,
      last_name: '', 
      cpf: CPF,
      email: null, 
      password: null,
      role: tipo,
      imagemBase64: imagemBase64,
      documentBase64: documentBase64,
      Telefone: Telefone
    };
    const createdUser = await usersModel.createUser(newUser);
    user = { id: createdUser.insertId };
  }

  // 3. Verifica se check-in já existe para este CPF + reserva
  const [existingCheckins] = await connection.execute(
    'SELECT id FROM checkin WHERE cod_reserva = ? AND CPF = ?',
    [cod_reserva, CPF]
  );

  // 4. Se check-in existir: retorna o ID existente (usuário já foi atualizado)
  if (existingCheckins.length > 0) {
    return { 
      checkinId: existingCheckins[0].id,
      message: 'Usuário atualizado, check-in já existente.' 
    };
  }

  // 5. Se check-in não existir: cria novo
  const insertCheckinQuery = `
    INSERT INTO checkin 
      (cod_reserva, CPF, tipo, reserva_id, user_id) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [cod_reserva, CPF, tipo, reserva_id, user.id];

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
  const [checkins] = await connection.execute(
    `SELECT 
       checkin.*, 
       users.first_name, 
       users.last_name, 
       users.Telefone, 
       users.imagemBase64, 
       users.documentBase64 
     FROM checkin
     LEFT JOIN users ON checkin.user_id = users.id
     WHERE checkin.id = ?`,
    [id]
  );
  return checkins[0];
};

const getCheckinsByReservaId = async (reservaId) => {
  const [checkins] = await connection.execute(
    `SELECT 
       checkin.*, 
       users.first_name, 
       users.last_name, 
       users.Telefone, 
       users.imagemBase64, 
       users.documentBase64 
     FROM checkin
     LEFT JOIN users ON checkin.user_id = users.id
     WHERE checkin.reserva_id = ?`,
    [reservaId]
  );
  return checkins;
};

const updateCheckin = async (checkin) => {
  const {id, cod_reserva,CPF,Nome,Telefone,imagemBase64,documentBase64,tipo,reserva_id } = checkin;
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

  // 2) Agora atualiza só as colunas do check‑in
  const [result] = await connection.execute(
    `UPDATE checkin
     SET cod_reserva = ?, CPF = ?, tipo = ?, reserva_id = ?
     WHERE id = ?`,
    [cod_reserva, CPF, tipo, reserva_id, id]
  );

  return result.affectedRows > 0;
};


const deleteCheckin = async (id) => {
  const [result] = await connection.execute('DELETE FROM checkin WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

const getCheckinByReservaIdOrCodReserva = async (reservaId, codReserva) => {
  // 1) Tenta buscar pelo reserva_id
  const [checkinsByReservaId] = await connection.execute(
    `SELECT
       c.*,
       u.first_name,
       u.last_name,
       u.Telefone,
       uf.imagemBase64,
       uf.documentBase64
     FROM checkin c
     LEFT JOIN users u    ON c.user_id = u.id
     LEFT JOIN user_files uf ON u.id = uf.user_id
     WHERE c.reserva_id = ?`,
    [reservaId]
  );

  if (checkinsByReservaId.length > 0) {
    return checkinsByReservaId;
  }

  // 2) Se não encontrou, busca pelo cod_reserva
  const [checkinsByCodReserva] = await connection.execute(
    `SELECT
       c.*,
       u.first_name,
       u.last_name,
       u.Telefone,
       uf.imagemBase64,
       uf.documentBase64
     FROM checkin c
     LEFT JOIN users u    ON c.user_id = u.id
     LEFT JOIN user_files uf ON u.id = uf.user_id
     WHERE c.cod_reserva = ?`,
    [codReserva]
  );

  return checkinsByCodReserva.length > 0 ? checkinsByCodReserva : null;
};

const getCheckinsByUserId = async (userId) => {
  const [checkins] = await connection.execute(
    `SELECT
       c.id,
       c.cod_reserva,
       c.CPF,
       c.tipo,
       c.reserva_id,
       a.nome AS apartamento_nome,
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