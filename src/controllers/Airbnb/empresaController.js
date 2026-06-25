const empresaModel = require('../../models/Airbnb/empresaModel');

// Lista as empresas ativas
const getAllEmpresas = async (request, response) => {
  try {
    const empresas = await empresaModel.getAllEmpresas();
    return response.status(200).json(empresas);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return response.status(500).json({ error: 'Erro ao listar empresas.' });
  }
};

module.exports = {
  getAllEmpresas
};
