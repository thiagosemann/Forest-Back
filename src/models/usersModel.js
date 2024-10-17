const connection = require('./connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

const getAllUsers = async () => {
  const [users] = await connection.execute('SELECT * FROM users');
  return users;
};

const saltRounds = 10;

const createUser = async (user) => {
  console.log(user)
  const { first_name, last_name, cpf, email, password, role, building_id } = user;

  // Gere o hash da senha
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const checkUserExistsQuery = 'SELECT * FROM users WHERE cpf = ? OR email = ?';
  const [existingUsers] = await connection.execute(checkUserExistsQuery, [cpf, email]);

  if (existingUsers.length > 0) {
    let conflictField = '';
    if (existingUsers[0].cpf === cpf) conflictField = 'CPF';
    else if (existingUsers[0].email === email) conflictField = 'e-mail';
    throw new Error(`Usuário com esse ${conflictField} já existe.`);
  }

  const insertUserQuery = 'INSERT INTO users (first_name, last_name, cpf, email, password, role, predio_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [first_name, last_name, cpf, email, hashedPassword, role, building_id];

  try {
    const [result] = await connection.execute(insertUserQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
    throw error;
  }
};

const loginUser = async (email, password) => {
  const query = `
  SELECT *
  FROM users
  WHERE email = ?;
`;
  const [users] = await connection.execute(query, [email]);

  if (users.length > 0) {
    const user = users[0];
    // Compare o hash da senha com a senha armazenada
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      // Senha está correta
      const token = jwt.sign(
        { id: user.id, email: user.email },
        SECRET_KEY
      );
      return { user, token };
    }
  }
};

const getUser = async (id) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  const [users] = await connection.execute(query, [id]);

  if (users.length > 0) {
    return users[0];
  } else {
    return null;
  }
};

const updateUser = async (id, user) => {
  const { first_name, last_name, cpf, email, password, role } = user;

  const getUserQuery = 'SELECT * FROM users WHERE id = ?';
  const [existingUsers] = await connection.execute(getUserQuery, [id]);

  if (existingUsers.length === 0) {
    throw new Error('Usuário não encontrado.');
  }

  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, saltRounds);
  }

  const updateUserQuery = `
    UPDATE users 
    SET first_name = ?, last_name = ?, cpf = ?, email = ?, role = ?
    ${password ? ', password = ?' : ''} 
    WHERE id = ?
  `;

  const values = password
    ? [first_name, last_name, cpf, email,  role, hashedPassword, id]
    : [first_name, last_name, cpf, email,  role,  id];

  try {
    await connection.execute(updateUserQuery, values);
    return { message: 'Usuário atualizado com sucesso.' };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

const getUsersByBuilding = async (building_id) => {
  const query = 'SELECT * FROM users WHERE predio_id = ?';
  const [users] = await connection.execute(query, [building_id]);
  return users;
};

const deleteUser = async (id) => {
  // Check if the user exists
  const getUserQuery = 'SELECT * FROM users WHERE id = ?';
  const [existingUsers] = await connection.execute(getUserQuery, [id]);

  if (existingUsers.length === 0) {
    return null; // Return null if the user doesn't exist
  }

  // Delete the user
  const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
  try {
    await connection.execute(deleteUserQuery, [id]);
    return true; // Return true if the user was deleted successfully
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    throw error;
  }
};

const createUsersBatch = async (users) => {
  const insertUserQuery = `
    INSERT INTO users (first_name, last_name, cpf, email, role, predio_id) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    for (let user of users) {
      const { first_name, last_name, cpf, email, role, building_id } = user;
      console.log(user)
      // Verifica se o usuário já existe pelo CPF ou e-mail
      const checkUserExistsQuery = 'SELECT * FROM users WHERE cpf = ? OR email = ?';
      const [existingUsers] = await connection.execute(checkUserExistsQuery, [cpf, email]);

      if (existingUsers.length > 0) {
        let conflictField = '';
        if (existingUsers[0].cpf === cpf) conflictField = 'CPF';
        else if (existingUsers[0].email === email) conflictField = 'e-mail';
        throw new Error(`Usuário com esse ${conflictField} já existe.`);
      }

      // Inserir o usuário
      const values = [first_name, last_name, cpf, email, role, building_id];
      await connection.execute(insertUserQuery, values);
    }

    return users; // Retorna os usuários inseridos
  } catch (error) {
    console.error('Erro ao inserir usuários em lote:', error);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
  getUsersByBuilding,
  createUsersBatch
};
