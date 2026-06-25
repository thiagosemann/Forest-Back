const apartamentoEmpresaModel = require('../../models/Airbnb/apartamentoEmpresaModel');

// Vincula um apartamento existente a uma empresa
const vincularEmpresa = async (request, response) => {
  try {
    const { apartamento_id, empresa_id } = request.body;
    if (!apartamento_id || !empresa_id) {
      return response.status(400).json({ error: 'apartamento_id e empresa_id são obrigatórios.' });
    }
    await apartamentoEmpresaModel.vincularEmpresa(apartamento_id, empresa_id);
    return response.status(201).json({ message: 'Empresa vinculada ao apartamento com sucesso.' });
  } catch (error) {
    console.error('Erro ao vincular empresa ao apartamento:', error);
    return response.status(500).json({ error: 'Erro ao vincular empresa ao apartamento.' });
  }
};

// Remove o vínculo entre um apartamento e uma empresa
const desvincularEmpresa = async (request, response) => {
  try {
    const { apartamento_id, empresa_id } = request.body;
    if (!apartamento_id || !empresa_id) {
      return response.status(400).json({ error: 'apartamento_id e empresa_id são obrigatórios.' });
    }
    const removed = await apartamentoEmpresaModel.desvincularEmpresa(apartamento_id, empresa_id);
    if (removed) {
      return response.status(200).json({ message: 'Vínculo removido com sucesso.' });
    }
    return response.status(404).json({ message: 'Vínculo não encontrado.' });
  } catch (error) {
    console.error('Erro ao desvincular empresa do apartamento:', error);
    return response.status(500).json({ error: 'Erro ao desvincular empresa do apartamento.' });
  }
};

// Lista as empresas vinculadas a um apartamento
const getEmpresasByApartamento = async (request, response) => {
  try {
    const { apartamento_id } = request.params;
    const empresas = await apartamentoEmpresaModel.getEmpresasByApartamento(apartamento_id);
    return response.status(200).json(empresas);
  } catch (error) {
    console.error('Erro ao listar empresas do apartamento:', error);
    return response.status(500).json({ error: 'Erro ao listar empresas do apartamento.' });
  }
};

// Lista os vínculos apartamento-empresa visíveis para a empresa logada
const getVinculosVisiveis = async (request, response) => {
  try {
    const { empresaId } = request;
    const vinculos = await apartamentoEmpresaModel.getVinculosVisiveis(empresaId);
    return response.status(200).json(vinculos);
  } catch (error) {
    console.error('Erro ao listar vínculos apartamento-empresa:', error);
    return response.status(500).json({ error: 'Erro ao listar vínculos apartamento-empresa.' });
  }
};

// Lista os terceirizados das empresas vinculadas aos apartamentos da empresa logada
const getTerceirizadosVisiveis = async (request, response) => {
  try {
    const { empresaId } = request;
    const terceirizados = await apartamentoEmpresaModel.getTerceirizadosVisiveis(empresaId);
    return response.status(200).json(terceirizados);
  } catch (error) {
    console.error('Erro ao listar terceirizados das empresas vinculadas:', error);
    return response.status(500).json({ error: 'Erro ao listar terceirizados das empresas vinculadas.' });
  }
};

module.exports = {
  vincularEmpresa,
  desvincularEmpresa,
  getEmpresasByApartamento,
  getVinculosVisiveis,
  getTerceirizadosVisiveis
};
