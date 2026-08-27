// authMiddleware.js
const jwt = require('jsonwebtoken');
const path = require('path');
const { getAuthContextByUserId } = require('../models/Airbnb/usersAirbnbModel');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const SECRET_KEY = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token.split(' ')[1], SECRET_KEY, async (err, decoded) => {
    if (err) {
      const expirado = err.name === 'TokenExpiredError';
      return res.status(401).send({
        code: expirado ? 'TOKEN_EXPIRADO' : 'TOKEN_INVALIDO',
        message: expirado ? 'Sessão expirada. Faça login novamente.' : 'Unauthorized!'
      });
    }

    req.userId = decoded.id;
    req.email = decoded.email;

    // Revogação em tempo real: se a empresa do usuário estiver suspensa, o token
    // (mesmo válido e já emitido) para de valer em qualquer rota autenticada.
    let contexto;
    try {
      contexto = await getAuthContextByUserId(decoded.id);
    } catch (error) {
      console.error('Erro ao carregar contexto de autenticação:', error);
      return res.status(503).send({ message: 'Não foi possível validar o acesso. Tente novamente.' });
    }

    // O banco do condomínio e o do Airbnb são separados e os ids se sobrepõem;
    // só tratamos o contexto como sendo deste usuário quando o e-mail confere.
    const mesmoUsuario = contexto && contexto.id === decoded.id
      && (contexto.email || '') === (decoded.email || '');

    if (mesmoUsuario) {
      if (contexto.empresa_id && contexto.empresa_status !== 'ativa') {
        return res.status(403).send({
          code: 'EMPRESA_INATIVA',
          message: 'Acesso suspenso. Entre em contato com o suporte.'
        });
      }
      req.authContext = contexto;
    }

    next();
  });
};

module.exports = verifyToken;
