const boletosModel = require('../../models/Administracao/prestacaoCobrancaBoletosModel');

// Obtém todos os registros de boletos
const getAllPrestacaoCobrancaBoletos = async (req, res) => {
  try {
    const boletos = await boletosModel.getAllPrestacaoCobrancaBoletos();
    return res.status(200).json(boletos);
  } catch (error) {
    console.error('Erro ao obter boletos:', error);
    return res.status(500).json({ error: 'Erro ao obter boletos' });
  }
};

// Cria um novo boleto
const createPrestacaoCobrancaBoletos = async (req, res) => {
  try {
    console.log(req.body);

    // Verificação básica dos parâmetros obrigatórios: predio_id e dataEnvio (pdf pode ser nulo)
    if (!req.body || !req.body.predio_id || !req.body.month || !req.body.year ) {
      return res.status(400).json({ error: 'Parâmetros predio_id e dataEnvio são obrigatórios' });
    }

    const { pdf, predio_id, month, year  } = req.body;

    const createdBoleto = await boletosModel.createPrestacaoCobrancaBoletos({ pdf, predio_id, month, year });
    return res.status(201).json(createdBoleto);
  } catch (error) {
    console.error('Erro ao criar boleto:', error);
    return res.status(409).json({ error: error.message });
  }
};

// Obtém um boleto pelo ID
const getPrestacaoCobrancaBoletoById = async (req, res) => {
  try {
    const { id } = req.params;
    const boleto = await boletosModel.getPrestacaoCobrancaBoletoById(id);

    if (boleto) {
      return res.status(200).json(boleto);
    } else {
      return res.status(404).json({ message: 'Boleto não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter boleto:', error);
    return res.status(500).json({ error: 'Erro ao obter boleto' });
  }
};

// Atualiza um boleto existente
const updatePrestacaoCobrancaBoleto = async (req, res) => {
  try {
    const { id } = req.params;

    // Pode ser enviado via req.files ou req.body
    let pdf = null;
    if (req.files && req.files.pdf) {
      pdf = req.files.pdf.data;
    } else if (req.body.pdf) {
      pdf = req.body.pdf;
    }

    const { predio_id, dataEnvio } = req.body;
    const boleto = { id, pdf, predio_id, dataEnvio };

    const wasUpdated = await boletosModel.updatePrestacaoCobrancaBoleto(boleto);

    if (wasUpdated) {
      return res.status(200).json({ message: 'Boleto atualizado com sucesso' });
    } else {
      return res.status(404).json({ message: 'Boleto não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar boleto:', error);
    return res.status(500).json({ error: 'Erro ao atualizar boleto' });
  }
};

// Deleta um boleto pelo ID
const deletePrestacaoCobrancaBoleto = async (req, res) => {
  try {
    const { id } = req.params;

    const wasDeleted = await boletosModel.deletePrestacaoCobrancaBoleto(id);

    if (wasDeleted) {
      return res.status(200).json({ message: 'Boleto deletado com sucesso' });
    } else {
      return res.status(404).json({ message: 'Boleto não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar boleto:', error);
    return res.status(500).json({ error: 'Erro ao deletar boleto' });
  }
};

// Obtém boletos filtrados por predio_id, mês e ano (utilizando o campo dataEnvio)
const getPrestacaoCobrancaBoletosByBuildingAndMonth = async (req, res) => {
  try {
    const { predio_id, month, year } = req.params;
    if (!predio_id || !month || !year) {
      return res.status(400).json({ error: 'Parâmetros predio_id, month e year são obrigatórios' });
    }

    const boletos = await boletosModel.getPrestacaoCobrancaBoletosByBuildingAndMonth(predio_id, month, year);

    if (boletos && boletos.length > 0) {
      return res.status(200).json(boletos);
    } else {
      return res.status(404).json({ message: 'Nenhum boleto encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter boletos por prédio e mês:', error);
    return res.status(500).json({ error: 'Erro ao obter boletos por prédio e mês' });
  }
};

module.exports = {
  getAllPrestacaoCobrancaBoletos,
  createPrestacaoCobrancaBoletos,
  getPrestacaoCobrancaBoletoById,
  updatePrestacaoCobrancaBoleto,
  deletePrestacaoCobrancaBoleto,
  getPrestacaoCobrancaBoletosByBuildingAndMonth
};
