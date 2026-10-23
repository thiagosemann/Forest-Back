const usersModel = require('../../models/Airbnb/usersAirbnbModel');
const { envioEmailRedefinicaoSenha } = require('../../email');

const FRONT_URL = process.env.FRONT_URL || 'https://www.apartamentosforest.com.br';

// Intervalo mínimo entre e-mails de redefinição para o mesmo endereço. A rota é
// pública e o envio sai da conta Gmail da Forest (que também manda os e-mails de
// check-in), então isso evita que ela seja usada para disparar spam.
const RESET_EMAIL_COOLDOWN_MS = 60 * 1000;
const resetEmailsRecentes = new Set();

const getAllUsers = async (request, response) => {
  try {
    const { empresaId } = request;
    const page  = parseInt(request.query.page)  || 1;
    const limit = parseInt(request.query.limit) || 20;
    const role  = request.query.role || null;
    const result = await usersModel.getAllUsers(empresaId, { page, limit, role });
    return response.status(200).json(result);
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    return response.status(500).json({ error: 'Erro ao obter usuários' });
  }
};

const createUser = async (request, response) => {
  try {
    const createdUser = await usersModel.createUser(request.body);
    return response.status(201).json(createdUser);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return response.status(409).json({ error: error.message });
  }
};

const loginUser = async (request, response) => {
  try {
    const { email, password } = request.body;

    const result = await usersModel.loginUser(email, password);
    if (result?.blocked) {
      // Credencial correta, mas a empresa do usuário está suspensa.
      return response.status(403).json({
        code: 'EMPRESA_INATIVA',
        message: 'Acesso suspenso. Entre em contato com o suporte.'
      });
    }
    if (result) {
      // Autenticação bem-sucedida
      return response.status(200).json({ user: result.user, token: result.token });
    } else {
      // Autenticação falhou
      return response.status(401).json({ message: 'Login ou senha incorretos.' });
    }
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return response.status(500).json({ error: 'Erro ao realizar login' });
  }
};
 
const forgotPassword = async (request, response) => {
  const email = String(request.body?.email || '').trim();
  if (!email) {
    return response.status(400).json({ message: 'Informe o e-mail.' });
  }

  // Resposta sempre igual (e antes do envio), para não revelar se o e-mail tem conta
  response.status(200).json({
    message: 'Se houver uma conta com esse e-mail, enviaremos um link para redefinir a senha.'
  });

  const chave = email.toLowerCase();
  if (resetEmailsRecentes.has(chave)) return;
  resetEmailsRecentes.add(chave);
  setTimeout(() => resetEmailsRecentes.delete(chave), RESET_EMAIL_COOLDOWN_MS).unref();

  try {
    const result = await usersModel.createPasswordResetToken(email);
    if (!result) return;

    const link = `${FRONT_URL}/resetPassword?token=${encodeURIComponent(result.token)}`;
    await envioEmailRedefinicaoSenha(result.user.email, result.user.first_name, link);
  } catch (error) {
    console.error('Erro ao enviar e-mail de redefinição de senha:', error);
  }
};

const resetPassword = async (request, response) => {
  try {
    const { token, password } = request.body || {};
    if (!token || !password) {
      return response.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
    }
    if (String(password).length < 4) {
      return response.status(400).json({ message: 'A senha deve ter pelo menos 4 caracteres.' });
    }

    const ok = await usersModel.resetPassword(token, String(password));
    if (!ok) {
      // 400 (e não 401) para o interceptor do front não tratar como sessão expirada
      return response.status(400).json({
        code: 'TOKEN_RESET_INVALIDO',
        message: 'Link inválido ou expirado. Solicite um novo.'
      });
    }
    return response.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return response.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};

const getUser = async (request, response) => {
  try {
    const { id } = request.params;
    const { empresaId } = request;
    const user = await usersModel.getUser(id, empresaId);

    if (user) {
      return response.status(200).json(user);
    } else {
      return response.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return response.status(500).json({ error: 'Erro ao obter usuário' });
  }
};

const updateUser = async (request, response) => {
  try {
    const { id } = request.params;
    const updatedUser = await usersModel.updateUser(id, request.body);
    return response.status(200).json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return response.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

const deleteUser = async (request, response) => {
  try {
    const { id } = request.params;
    const deletedUser = await usersModel.deleteUser(id);
    if (deletedUser) {
      return response.status(200).json({ message: 'Usuário excluído com sucesso.' });
    } else {
      return response.status(404).json({ message: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return response.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
};

const createUsersBatch = async (request, response) => {
  try {
    const users = request.body; // Array de objetos com first_name, last_name, cpf, email
    const createdUsers = await usersModel.createUsersBatch(users);
    return response.status(201).json({ message: `${createdUsers.length} usuários criados com sucesso.` });
  } catch (error) {
    console.error('Erro ao criar usuários em lote:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getUsersByRole = async (request, response) => {
  try {
    const { role } = request.params; // Obtém o papel (role) da URL
    const { empresaId } = request;
    const users = await usersModel.getUsersByRole(role, empresaId);
    return response.status(200).json(users);
  } catch (error) {
    console.error('Erro ao obter usuários por papel:', error);
    return response.status(500).json({ error: 'Erro ao obter usuários por papel' });
  }
};

const getProprietarios = async (request, response) => {
  try {
    const { empresaId } = request;
    const users = await usersModel.getUsersByRole('proprietario', empresaId);
    return response.status(200).json(users);
  } catch (error) {
    console.error('Erro ao obter usuários proprietários:', error);
    return response.status(500).json({ error: 'Erro ao obter usuários proprietários' });
  }
};

const getUserByTelefone = async (request, response) => {
  try {
    const { telefone } = request.params; // `telefone` vem da URL
    const { empresaId } = request;
    const user = await usersModel.getUserByTelefone(telefone, empresaId);

    if (user) {
      return response.status(200).json(user);
    } else {
      return response.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter usuário por telefone:', error);
    return response.status(500).json({ error: 'Erro ao obter usuário por telefone' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUser,
  updateUser,
  deleteUser,
  createUsersBatch,
  getUsersByRole,
  getUserByTelefone,
  getProprietarios
};