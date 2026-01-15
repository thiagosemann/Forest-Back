
const connection = require('../connection2');

// Adiciona vínculo entre apartamento e proprietário
const addProprietarioToApartamento = async (apartamento_id, user_id) => {
  const query = `INSERT INTO apartamento_proprietario (apartamento_id, user_id) VALUES (?, ?)`;
  try {
    await connection.execute(query, [apartamento_id, user_id]);
    return true;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Esse vínculo já existe.');
    }
    throw error;
  }
};

// Remove vínculo entre apartamento e proprietário
const removeProprietarioFromApartamento = async (apartamento_id, user_id) => {
  const query = `DELETE FROM apartamento_proprietario WHERE apartamento_id = ? AND user_id = ?`;
  const [result] = await connection.execute(query, [apartamento_id, user_id]);
  return result.affectedRows > 0;
};

// Busca todos os proprietários de um apartamento
const getProprietariosByApartamento = async (apartamento_id) => {
  const query = `SELECT u.* FROM users u INNER JOIN apartamento_proprietario ap ON u.id = ap.user_id WHERE ap.apartamento_id = ?`;
  const [rows] = await connection.execute(query, [apartamento_id]);
  return rows;
};

// Busca todos os apartamentos de um proprietário
const getApartamentosByProprietario = async (user_id) => {
  const query = `SELECT a.* FROM apartamentos a INNER JOIN apartamento_proprietario ap ON a.id = ap.apartamento_id WHERE ap.user_id = ?`;
  const [rows] = await connection.execute(query, [user_id]);
  return rows;
};

// Remove todos os vínculos de um apartamento
const removeAllProprietariosFromApartamento = async (apartamento_id) => {
  const query = `DELETE FROM apartamento_proprietario WHERE apartamento_id = ?`;
  await connection.execute(query, [apartamento_id]);
};

// Remove todos os vínculos de um proprietário
const removeAllApartamentosFromProprietario = async (user_id) => {
  const query = `DELETE FROM apartamento_proprietario WHERE user_id = ?`;
  await connection.execute(query, [user_id]);
};

// Busca apartamentos sem qualquer vínculo com proprietário (id e nome)
const getApartamentosSemVinculo = async (empresaId) => {
  if (empresaId == null) {
    return [];
  }

  let query = `
    SELECT a.id, a.nome
    FROM apartamentos a
    LEFT JOIN apartamento_proprietario ap ON a.id = ap.apartamento_id
    WHERE ap.apartamento_id IS NULL
      AND a.empresa_id = ?
  `;
  const params = [empresaId];

  const [rows] = await connection.execute(query, params);
  return rows;
};

module.exports = {
  addProprietarioToApartamento,
  removeProprietarioFromApartamento,
  getProprietariosByApartamento,
  getApartamentosByProprietario,
  removeAllProprietariosFromApartamento,
  removeAllApartamentosFromProprietario,
  getApartamentosSemVinculo
};
