const connection = require('../connection2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
const saltRounds = 10;

// Helper to fetch files for a user
const getUserFiles = async (userId) => {
  const [rows] = await connection.execute(
    'SELECT imagemBase64, documentBase64 FROM user_files WHERE user_id = ?',
    [userId]
  );
  return rows[0] || { imagemBase64: null, documentBase64: null };
};

const getAllUsers = async () => {
  const [users] = await connection.execute(
    `SELECT u.* 
     FROM users u`
  );
  return users;
};


const createUser = async (user) => {
  const {
    first_name,
    last_name,
    cpf,
    email,
    password,
    role,
    imagemBase64,
    documentBase64,
    Telefone,
    grupo_whats // <-- Adicionado aqui
  } = user;

  // Hash password if provided
  const hashedPassword = password
    ? await bcrypt.hash(password, saltRounds)
    : null;
  const roleValue = role || 'guest';

  // Check duplicate by CPF
  const checkUserExistsQuery = 'SELECT id, cpf FROM users WHERE cpf = ?';
  const [existingUsers] = await connection.execute(checkUserExistsQuery, [cpf || '']);
  if (existingUsers.length > 0) {
    const conflictField = existingUsers[0].cpf === cpf ? 'CPF' : 'field';
    throw new Error(`Usuário com esse ${conflictField} já existe.`);
  }

  // Insert into users table (agora inclui grupo_whats)
  const insertUserQuery = `
    INSERT INTO users
      (first_name, last_name, cpf, email, password, role, Telefone, grupo_whats)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    first_name,
    last_name,
    cpf,
    email || '',
    hashedPassword,
    roleValue,
    Telefone || null,
    grupo_whats || null // <-- Adicionado aqui
  ];

  try {
    const [result] = await connection.execute(insertUserQuery, values);
    const userId = result.insertId;

    // Insert into user_files
    await connection.execute(
      `INSERT INTO user_files (user_id, imagemBase64, documentBase64)
       VALUES (?, ?, ?)`,
      [userId, imagemBase64 || null, documentBase64 || null]
    );

    return { insertId: userId };
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
    throw error;
  }
};

const loginUser = async (email, password) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [users] = await connection.execute(query, [email]);
  if (!users.length) return;

  const user = users[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return;

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
  return { user, token };
};

const getUser = async (id) => {
  // Fetch user and join files
  const query = `
    SELECT u.*, uf.imagemBase64, uf.documentBase64
    FROM users u
    LEFT JOIN user_files uf ON u.id = uf.user_id
    WHERE u.id = ?
  `;
  const [rows] = await connection.execute(query, [id]);
  return rows[0] || null;
};

const updateUser = async (id, userData) => {
  const existingUser = await getUser(id);
  if (!existingUser) throw new Error('Usuário não encontrado.');

  // Merge with existing data
  const merged = { ...existingUser, ...userData };
  const {
    first_name,
    last_name,
    cpf,
    email,
    password,
    role,
    Telefone,
    imagemBase64,
    documentBase64,
    grupo_whats // <-- Adicionado aqui
  } = merged;

  // Hash password if updated
  let hashedPassword = null;
  if (password && password !== existingUser.password) {
    hashedPassword = await bcrypt.hash(password, saltRounds);
  }

  // Update users table (agora inclui grupo_whats)
  const updateUserQuery = `
    UPDATE users SET
      first_name = ?,
      last_name = ?,
      cpf = ?,
      email = ?,
      role = ?,
      Telefone = ?,
      grupo_whats = ?
      ${hashedPassword ? ', password = ?' : ''}
    WHERE id = ?
  `;
  const values = [
    first_name,
    last_name,
    cpf,
    email,
    role,
    Telefone,
    grupo_whats || null, // <-- Adicionado aqui
    ...(hashedPassword ? [hashedPassword] : []),
    id
  ];

  try {
    await connection.execute(updateUserQuery, values);

    // Upsert into user_files if images provided
    if (userData.imagemBase64 != null || userData.documentBase64 != null) {
      // Check existing files
      const [files] = await connection.execute(
        'SELECT id FROM user_files WHERE user_id = ?',
        [id]
      );
      if (files.length) {
        // Update
        const updateFiles = `
          UPDATE user_files SET
            imagemBase64 = ?,
            documentBase64 = ?
          WHERE user_id = ?
        `;
        await connection.execute(updateFiles, [imagemBase64 || null, documentBase64 || null, id]);
      } else {
        // Insert new
        const insertFiles = `
          INSERT INTO user_files (user_id, imagemBase64, documentBase64)
          VALUES (?, ?, ?)
        `;
        await connection.execute(insertFiles, [id, imagemBase64 || null, documentBase64 || null]);
      }
    }

    return { message: 'Usuário atualizado com sucesso.' };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

const deleteUser = async (id) => {
  // Delete files and quotas first
  await connection.execute('DELETE FROM user_files WHERE user_id = ?', [id]);

  const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
  try {
    const [result] = await connection.execute(deleteUserQuery, [id]);
    return result.affectedRows ? true : null;
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    throw error;
  }
};
const getUserByCPF = async (cpf) => {
  const query = 'SELECT * FROM users WHERE cpf = ?';
  const [users] = await connection.execute(query, [cpf]);
  return users[0] || null;
};

const getUsersByRole = async (role) => {
  let params = [role];
  try {
    const [users] = await connection.execute('SELECT * FROM users WHERE role = ?', params);
    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários por role:', error);
    throw error;
  }
};

const getUserByTelefone = async (telefone) => {
  const query = 'SELECT * FROM users WHERE Telefone = ?';
  const [users] = await connection.execute(query, [telefone]);
  return users[0] || null;
};

// Other methods (batch inserts, get by CPF/role) left unchanged
module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
  getUserByCPF,
  getUsersByRole,
  getUserFiles,
  getUserByTelefone
};
