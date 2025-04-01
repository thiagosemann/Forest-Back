const extratosPdfModel = require('../../models/Administracao/extratoPdfModel');

const getAllExtratosPdf = async (request, response) => {
  try {
    const extratos = await extratosPdfModel.getAllExtratosPdf();
    return response.status(200).json(extratos);
  } catch (error) {
    console.error('Erro ao obter extratos PDF:', error);
    return response.status(500).json({ error: 'Erro ao obter extratos PDF' });
  }
};

const createExtratoPdf = async (request, response) => {
  try {
    if (!request.body || !request.body.documento) {
      return response.status(400).json({ error: 'Arquivo PDF não fornecido' });
    }

    const createdExtrato = await extratosPdfModel.createExtratoPdf(request.body);

    return response.status(201).json(createdExtrato);
  } catch (error) {
    console.error('Erro ao criar extrato PDF:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getExtratoPdfById = async (request, response) => {
  try {
    const { id } = request.params;
    const extrato = await extratosPdfModel.getExtratoPdfById(id);

    if (extrato) {
      return response.status(200).json(extrato);
    }
    return response.status(404).json({ message: 'Extrato não encontrado' });
  } catch (error) {
    console.error('Erro ao obter extrato:', error);
    return response.status(500).json({ error: 'Erro ao obter extrato' });
  }
};

const updateExtratoPdf = async (request, response) => {
  try {
    const { id } = request.params;

    let documento = null;
    if (request.files && request.files.documento) {
      documento = request.files.documento.data;
    }

    const { data_gasto } = request.body;

    const extrato = { id, documento, data_gasto };
    const wasUpdated = await extratosPdfModel.updateExtratoPdf(extrato);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Extrato atualizado com sucesso' });
    }
    return response.status(404).json({ message: 'Extrato não encontrado' });
  } catch (error) {
    console.error('Erro ao atualizar extrato:', error);
    return response.status(500).json({ error: 'Erro ao atualizar extrato' });
  }
};

const deleteExtratoPdf = async (request, response) => {
  try {
    const { id } = request.params;
    const wasDeleted = await extratosPdfModel.deleteExtratoPdf(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Extrato deletado com sucesso' });
    }
    return response.status(404).json({ message: 'Extrato não encontrado' });
  } catch (error) {
    console.error('Erro ao deletar extrato:', error);
    return response.status(500).json({ error: 'Erro ao deletar extrato' });
  }
};

const getExtratosPdfByBuildingMonthYear = async (request, response) => {
  try {
    const { predio_id, month, year } = request.params;
    
    if (!predio_id || !month || !year) {
      return response.status(400).json({ 
        error: 'Parâmetros month e year são obrigatórios' 
      });
    }

    const extratos = await extratosPdfModel.getExtratosPdfByBuildingMonthYear(predio_id,month, year);

    if (extratos.length > 0) {
      return response.status(200).json(extratos);
    }
    return response.status(404).json({ message: 'Nenhum extrato encontrado' });
  } catch (error) {
    console.error('Erro ao buscar extratos por mês/ano:', error);
    return response.status(500).json({ error: 'Erro ao buscar extratos' });
  }
};

module.exports = {
  getAllExtratosPdf,
  createExtratoPdf,
  getExtratoPdfById,
  updateExtratoPdf,
  deleteExtratoPdf,
  getExtratosPdfByBuildingMonthYear
};