const { getAuthContextByUserId } = require('../models/Airbnb/usersAirbnbModel');

const empresaMiddleware = async (req, res, next) => {
  try {
    // O authMiddleware normalmente já carregou o contexto; reaproveitamos para
    // não fazer uma segunda consulta no mesmo request.
    const contexto = req.authContext || await getAuthContextByUserId(req.userId);

    if (!contexto?.empresa_id) {
      return res.status(403).json({ code: 'SEM_EMPRESA', message: 'Usuário sem empresa vinculada.' });
    }

    if (contexto.empresa_status !== 'ativa') {
      return res.status(403).json({
        code: 'EMPRESA_INATIVA',
        message: 'Acesso suspenso. Entre em contato com o suporte.'
      });
    }

    req.empresaId = contexto.empresa_id;
    next();
  } catch (error) {
    console.error('Erro ao identificar empresa do usuário:', error);
    res.status(500).json({ message: 'Erro ao identificar empresa do usuário.' });
  }
};

module.exports = empresaMiddleware;
