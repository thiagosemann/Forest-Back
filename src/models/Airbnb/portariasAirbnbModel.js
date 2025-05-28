const connection = require('../connection2');

// Buscar todas as portarias
const getAllPortarias = async () => {
  const [portarias] = await connection.execute('SELECT * FROM portarias');
  return portarias;
};

// Criar uma nova portaria
const createPortaria = async (portaria) => {
  const {
    nome,
    telefone_principal,
    telefone_secundario,
    email,
    modo_envio,
    envio_documentos_texto,
    envio_documentos_foto,
    cadastro_aplicativo,
    aplicativo_nome,
    aplicativo_login,
    aplicativo_senha,
  } = portaria;

  const insertQuery = `
    INSERT INTO portarias (
      nome,
      telefone_principal,
      telefone_secundario,
      email,
      modo_envio,
      envio_documentos_texto,
      envio_documentos_foto,
      cadastro_aplicativo,
      aplicativo_nome,
      aplicativo_login,
      aplicativo_senha
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;

  const values = [
    nome,
    telefone_principal || null,
    telefone_secundario || null,
    email || null,
    modo_envio || 'email',
    envio_documentos_texto || 0,
    envio_documentos_foto || 0,
    cadastro_aplicativo || 0,
    aplicativo_nome || null,
    aplicativo_login || null,
    aplicativo_senha || null,
  ];

  try {
    const [result] = await connection.execute(insertQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir portaria:', error);
    throw error;
  }
};

// Buscar uma portaria pelo ID
const getPortariaById = async (id) => {
  const query = 'SELECT * FROM portarias WHERE id = ?';
  const [rows] = await connection.execute(query, [id]);
  return rows.length > 0 ? rows[0] : null;
};

// Atualizar uma portaria
const updatePortaria = async (portaria) => {
  const {
    id,
    nome,
    telefone_principal,
    telefone_secundario,
    email,
    modo_envio,
    envio_documentos_texto,
    envio_documentos_foto,
    cadastro_aplicativo,
    aplicativo_nome,
    aplicativo_login,
    aplicativo_senha,
  } = portaria;

  const updateQuery = `
    UPDATE portarias SET
      nome = ?,
      telefone_principal = ?,
      telefone_secundario = ?,
      email = ?,
      modo_envio = ?,
      envio_documentos_texto = ?,
      envio_documentos_foto = ?,
      cadastro_aplicativo = ?,
      aplicativo_nome = ?,
      aplicativo_login = ?,
      aplicativo_senha = ?
    WHERE id = ?
  `;

  const values = [
    nome,
    telefone_principal || null,
    telefone_secundario || null,
    email || null,
    modo_envio || 'email',
    envio_documentos_texto || 0,
    envio_documentos_foto || 0,
    cadastro_aplicativo || 0,
    aplicativo_nome || null,
    aplicativo_login || null,
    aplicativo_senha || null,
    id
  ];

  try {
    const [result] = await connection.execute(updateQuery, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar portaria:', error);
    throw error;
  }
};

// Deletar uma portaria pelo ID
const deletePortaria = async (id) => {
  const query = 'DELETE FROM portarias WHERE id = ?';
  try {
    const [result] = await connection.execute(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar portaria:', error);
    throw error;
  }
};

module.exports = {
  getAllPortarias,
  createPortaria,
  getPortariaById,
  updatePortaria,
  deletePortaria
};
