const connection = require('../connection2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
const saltRounds = 10;

const getAllUsers = async () => {
  const [users] = await connection.execute('SELECT * FROM users');
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
    Telefone 
  } = user;

  let hashedPassword = password ? await bcrypt.hash(password, saltRounds) : null;
  const roleValue = role || 'guest';

  const checkUserExistsQuery = 'SELECT * FROM users WHERE cpf = ? OR email = ?';
  const [existingUsers] = await connection.execute(checkUserExistsQuery, [cpf, email || '']);

  if (existingUsers.length > 0) {
    let conflictField = '';
    if (existingUsers[0].cpf === cpf) conflictField = 'CPF';
    else if (existingUsers[0].email === email) conflictField = 'e-mail';
    throw new Error(`Usuário com esse ${conflictField} já existe.`);
  }

  const insertUserQuery = `
    INSERT INTO users 
      (first_name, last_name, cpf, email, password, role, imagemBase64, documentBase64, Telefone) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    first_name,
    last_name,
    cpf,
    email || '',
    hashedPassword,
    roleValue,
    imagemBase64 || null,
    documentBase64 || null,
    Telefone || null
  ];

  try {
    const [result] = await connection.execute(insertUserQuery, values);
    
    if (roleValue === 'tercerizado') {
      await connection.execute(
        'INSERT INTO quant_limpezas_por_dia (user_id) VALUES (?)',
        [result.insertId]
      );
    }
    
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
    throw error;
  }
};

const loginUser = async (email, password) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [users] = await connection.execute(query, [email]);

  if (users.length > 0) {
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
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
  return users[0] || null;
};

const updateUser = async (id, userData) => {
  const existingUser = await getUser(id);
  if (!existingUser) throw new Error('Usuário não encontrado.');

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
    Telefone,
    segunda,
    terca,
    quarta,
    quinta,
    sexta,
    sabado,
    domingo
  } = mergedUser;

  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, saltRounds);
  }

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

  const values = [
    first_name,
    last_name,
    cpf,
    email,
    role,
    imagemBase64,
    documentBase64,
    Telefone,
    ...(password ? [hashedPassword] : []),
    id
  ];

  try {
    await connection.execute(updateUserQuery, values);
    if (role === 'tercerizado') {
      // Atualiza ou insere os valores de limpeza
      await connection.execute(
        `INSERT INTO quant_limpezas_por_dia 
          (user_id, segunda, terca, quarta, quinta, sexta, sabado, domingo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           segunda = VALUES(segunda),
           terca = VALUES(terca),
           quarta = VALUES(quarta),
           quinta = VALUES(quinta),
           sexta = VALUES(sexta),
           sabado = VALUES(sabado),
           domingo = VALUES(domingo)`,
        [
          id,
          segunda || 0,
          terca || 0,
          quarta || 0,
          quinta || 0,
          sexta || 0,
          sabado || 0,
          domingo || 0
        ]
      );
    } else {
      await connection.execute(
        'DELETE FROM quant_limpezas_por_dia WHERE user_id = ?',
        [id]
      );
    }
    
    return { message: 'Usuário atualizado com sucesso.' };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

const deleteUser = async (id) => {
  const getUserQuery = 'SELECT * FROM users WHERE id = ?';
  const [existingUsers] = await connection.execute(getUserQuery, [id]);

  if (existingUsers.length === 0) {
    return null;
  }

  const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
  try {
    await connection.execute(deleteUserQuery, [id]);
    
    await connection.execute(
      'DELETE FROM quant_limpezas_por_dia WHERE user_id = ?',
      [id]
    );
    
    return true;
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
      const checkUserExistsQuery = 'SELECT * FROM users WHERE cpf = ? OR email = ?';
      const [existingUsers] = await connection.execute(checkUserExistsQuery, [cpf, email]);

      if (existingUsers.length > 0) {
        let conflictField = '';
        if (existingUsers[0].cpf === cpf) conflictField = 'CPF';
        else if (existingUsers[0].email === email) conflictField = 'e-mail';
        throw new Error(`Usuário com esse ${conflictField} já existe.`);
      }

      const values = [first_name, last_name, cpf, email, role];
      const [insertResult] = await connection.execute(insertUserQuery, values);
      
      if (role === 'tercerizado') {
        await connection.execute(
          'INSERT INTO quant_limpezas_por_dia (user_id) VALUES (?)',
          [insertResult.insertId]
        );
      }
    }

    return users;
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
  let query;
  let params = [role];

  if (role === 'tercerizado') {
    query = `
      SELECT 
        users.*,
        quant_limpezas_por_dia.segunda,
        quant_limpezas_por_dia.terca,
        quant_limpezas_por_dia.quarta,
        quant_limpezas_por_dia.quinta,
        quant_limpezas_por_dia.sexta,
        quant_limpezas_por_dia.sabado,
        quant_limpezas_por_dia.domingo
      FROM users
      LEFT JOIN quant_limpezas_por_dia 
        ON users.id = quant_limpezas_por_dia.user_id
      WHERE users.role = ?
    `;
  } else {
    query = 'SELECT * FROM users WHERE role = ?';
  }

  try {
    const [users] = await connection.execute(query, params);
    
    // Garante valores padrão 0 para dias sem registro
    if (role === 'tercerizado') {
      return users.map(user => ({
        ...user,
        segunda: user.segunda || 0,
        terca: user.terca || 0,
        quarta: user.quarta || 0,
        quinta: user.quinta || 0,
        sexta: user.sexta || 0,
        sabado: user.sabado || 0,
        domingo: user.domingo || 0
      }));
    }
    
    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários por role:', error);
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
  createUsersBatch,
  getUserByCPF,
  getUsersByRole
};