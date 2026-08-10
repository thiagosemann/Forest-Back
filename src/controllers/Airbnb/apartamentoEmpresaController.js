const apartamentoEmpresaModel = require('../../models/Airbnb/apartamentoEmpresaModel');

// Garante que a empresa logada é a dona do apartamento (apartamentos.empresa_id),
// única autorizada a conceder ou revogar acesso das demais empresas.
// Devolve a resposta de erro já enviada, ou null quando a empresa é a dona.
const validarEmpresaDona = async (apartamento_id, empresaId, response) => {
  const apartamento = await apartamentoEmpresaModel.getApartamentoDono(apartamento_id);
  if (!apartamento) {
    return response.status(404).json({ error: 'Apartamento não encontrado.' });
  }
  if (apartamento.empresa_id == null) {
    return response.status(409).json({ error: 'Apartamento sem empresa dona definida. Ajuste o cadastro antes de gerenciar os acessos.' });
  }
  if (Number(apartamento.empresa_id) !== Number(empresaId)) {
    return response.status(403).json({ error: 'Apenas a empresa que cadastrou o apartamento pode gerenciar seus acessos.' });
  }
  return null;
};

// Vincula um apartamento existente a uma empresa
const vincularEmpresa = async (request, response) => {
  try {
    const { apartamento_id, empresa_id } = request.body;
    const { empresaId } = request;
    if (!apartamento_id || !empresa_id) {
      return response.status(400).json({ error: 'apartamento_id e empresa_id são obrigatórios.' });
    }

    const erro = await validarEmpresaDona(apartamento_id, empresaId, response);
    if (erro) return erro;

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
    const { empresaId } = request;
    if (!apartamento_id || !empresa_id) {
      return response.status(400).json({ error: 'apartamento_id e empresa_id são obrigatórios.' });
    }

    const erro = await validarEmpresaDona(apartamento_id, empresaId, response);
    if (erro) return erro;

    // O vínculo da empresa dona é o que sustenta a visibilidade do apartamento
    // em todas as telas (reservas, limpeza, tickets). Removê-lo deixaria o
    // apartamento invisível para todos, sem tela para desfazer.
    if (Number(empresa_id) === Number(empresaId)) {
      return response.status(400).json({ error: 'Não é possível remover o acesso da empresa dona do apartamento.' });
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

// Lista as empresas vinculadas a um apartamento (qualquer empresa com vínculo
// ativo pode consultar, mas só a dona altera)
const getEmpresasByApartamento = async (request, response) => {
  try {
    const { apartamento_id } = request.params;
    const { empresaId } = request;

    const temAcesso = await apartamentoEmpresaModel.temVinculoAtivo(apartamento_id, empresaId);
    if (!temAcesso) {
      return response.status(403).json({ error: 'Empresa sem acesso a este apartamento.' });
    }

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
