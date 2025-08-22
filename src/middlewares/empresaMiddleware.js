const { getEmpresaIdByUserId } = require('../models/Airbnb/usersAirbnbModel');

const empresaMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId;
    // Função que retorna o empresa_id do usuário
    const empresaId = await getEmpresaIdByUserId(userId);
    if (!empresaId) {
      return res.status(403).json({ message: 'Usuário sem empresa vinculada.' });
    }
    req.empresaId = empresaId;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao identificar empresa do usuário.' });
  }
};

module.exports = empresaMiddleware;