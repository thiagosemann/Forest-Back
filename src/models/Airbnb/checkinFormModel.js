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

  const [reservas] = await connection.execute(
    'SELECT id FROM reservas WHERE cod_reserva = ?', 
    [cod_reserva]
  );
  
  const reserva_id = reservas[0]?.id || null;


  // Verifica se o usuário já existe pelo CPF
  let user = await usersModel.getUserByCPF(CPF);

  if (user) {
    // Se o usuário existir, atualiza as informações
    const updatedUserData = {
      first_name: Nome,
      role: tipo,
      imagemBase64: imagemBase64,
      documentBase64: documentBase64,
      Telefone: Telefone
    };

    await usersModel.updateUser(user.id, updatedUserData);
  } else {
    // Se o usuário não existir, cria um novo usuário
    const newUser = {
      first_name: Nome,
      last_name: '', // Ajuste conforme necessário
      cpf: CPF,
      email: null, // Ajuste conforme necessário
      password: null, // Ajuste conforme necessário
      role: tipo,
      imagemBase64: imagemBase64,
      documentBase64: documentBase64,
      Telefone: Telefone
    };

    const createdUser = await usersModel.createUser(newUser);
    user = { id: createdUser.insertId }; // Obtém o ID do usuário criado
  }

  // Cria o check-in com as informações fornecidas
  const insertCheckinQuery = `
    INSERT INTO checkin 
      (cod_reserva, CPF, tipo, reserva_id, user_id) 
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    cod_reserva,
    CPF,
    tipo,
    reserva_id,
    user.id // user_id é o ID do usuário criado ou atualizado
  ];

  try {
    const [result] = await connection.execute(insertCheckinQuery, values);
    return { insertId: result.insertId }; // Retorna o ID do check-in criado
  } catch (error) {
    console.error('Erro ao criar check-in:', error);
    throw error;
  }
};;

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

module.exports = {
  getAllCheckins,
  createCheckin,
  getCheckinById,
  getCheckinsByReservaId,
  updateCheckin,
  deleteCheckin,
  getCheckinByReservaIdOrCodReserva
};