const connection = require('../connection2');
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
  const { 
    first_name, 
    last_name, 
    cpf, 
    email, 
    password, 
    role, 
    imagemBase64, 
    documentBase64, 
    Telefone 
  } = user;

  // Verificando se a senha foi fornecida e criptografando-a apenas se necessário
  let hashedPassword = password ? await bcrypt.hash(password, saltRounds) : null;

  // Verificando se o CPF ou email já existem no banco
  const checkUserExistsQuery = 'SELECT * FROM users WHERE cpf = ? OR email = ?';
  const [existingUsers] = await connection.execute(checkUserExistsQuery, [cpf, email || '']);

  if (existingUsers.length > 0) {
    let conflictField = '';
    if (existingUsers[0].cpf === cpf) conflictField = 'CPF';
    else if (existingUsers[0].email === email) conflictField = 'e-mail';
    throw new Error(`Usuário com esse ${conflictField} já existe.`);
  }

  // Inserção do novo usuário no banco de dados
  const insertUserQuery = `
    INSERT INTO users 
      (first_name, last_name, cpf, email, password, role, imagemBase64, documentBase64, Telefone) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  // Definindo os valores, garantindo que campos não fornecidos sejam tratados adequadamente
  const values = [
    first_name,
    last_name,
    cpf,
    email || '',  // Caso o email não seja fornecido, insere uma string vazia
    hashedPassword,  // Se a senha não for fornecida, isso será null
    role || 'guest',  // Se a role não for fornecida, assume 'guest' por padrão
    imagemBase64 || null,  // Se a imagem não for fornecida, assume null
    documentBase64 || null,  // Se o documento não for fornecido, assume null
    Telefone || null  // Se o telefone não for fornecido, assume null
  ];

  try {
    const [result] = await connection.execute(insertUserQuery, values);
    return { insertId: result.insertId };  // Retorna o ID do usuário inserido
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
    throw error;  // Lança erro caso a inserção falhe
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

const updateUser = async (id, userData) => {
  const existingUser = await getUser(id);
  if (!existingUser) throw new Error('Usuário não encontrado.');

  // Mescla os dados existentes com os novos dados
  const mergedUser = { ...existingUser, ...userData };
  const { 
    first_name, 
    last_name, 
    cpf, 
    email, 
    password, 
    role, 
    imagemBase64, 
    documentBase64, 
    Telefone 
  } = mergedUser;

  // Gera o hash da senha apenas se uma nova senha for fornecida
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, saltRounds);
  }

  // Constrói a query SQL dinamicamente
  const updateUserQuery = `
    UPDATE users 
    SET 
      first_name = ?, 
      last_name = ?, 
      cpf = ?, 
      email = ?, 
      role = ?, 
      imagemBase64 = ?, 
      documentBase64 = ?, 
      Telefone = ?
      ${password ? ', password = ?' : ''}
    WHERE id = ?
  `;

  // Prepara os valores para a query
  const values = [
    first_name,
    last_name,
    cpf,
    email,
    role,
    imagemBase64,
    documentBase64,
    Telefone,
    ...(password ? [hashedPassword] : []), // Adiciona a senha apenas se for fornecida
    id
  ];

  // Executa a query
  await connection.execute(updateUserQuery, values);
  return { message: 'Usuário atualizado com sucesso.' };
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
    INSERT INTO users (first_name, last_name, cpf, email, role) 
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    for (let user of users) {
      const { first_name, last_name, cpf, email, role } = user;
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
      const values = [first_name, last_name, cpf, email, role];
      await connection.execute(insertUserQuery, values);
    }

    return users; // Retorna os usuários inseridos
  } catch (error) {
    console.error('Erro ao inserir usuários em lote:', error);
    throw error;
  }
};
const getUserByCPF = async (cpf) => {
  const query = 'SELECT * FROM users WHERE cpf = ?';
  const [users] = await connection.execute(query, [cpf]);
  return users[0] || null;
};
const getUsersByRole = async (role) => {
  const query = 'SELECT * FROM users WHERE role = ?';
  const [users] = await connection.execute(query, [role]);
  return users;
};



module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
  createUsersBatch,
  getUserByCPF,
  getUsersByRole
};
