const rateioBoletoModel = require('../../models/Administracao/rateiosBoletosEmailModel');
const rateioPorApartamentoModel = require('../../models/Administracao/rateioPorApartamentoModel');

const getAllRateioBoletoEmails = async (req, res) => {
  try {
    const rateios = await rateioBoletoModel.getAllRateioBoletoEmails();
    return res.status(200).json(rateios);
  } catch (error) {
    console.error('Erro ao obter rateios/boletos:', error);
    return res.status(500).json({ error: 'Erro ao obter registros' });
  }
};

const createRateioBoletoEmail = async (req, res) => {
  try {
    const {
      rateioPdf,
      boletoPdf,
      rateioPdfFileName,
      boletoPdfFileName,
      rateioApartamento_id,
      rateio_id
    } = req.body;

    // 1. Buscar o registro de rateio_por_apartamento
    const rateioApartamento = await rateioPorApartamentoModel.getApartamentoByRateioIdEApartamentoId(
      rateio_id,
      rateioApartamento_id
    );

    if (!rateioApartamento) {
      return res.status(404).json({ error: 'Registro de rateio não encontrado' });
    }

    let result;

    // 2. Verificar se já existe um rateio_boleto_email vinculado
    if (rateioApartamento.rateio_boleto_email_id) {
      // Atualizar registro existente
      const existing = await rateioBoletoModel.getRateioBoletoEmailById(
        rateioApartamento.rateio_boleto_email_id
      );

      // Mesclar dados existentes com novos
      const updateData = {
        rateioPdf: rateioPdf || existing.rateioPdf,
        boletoPdf: boletoPdf || existing.boletoPdf,
        rateioPdfFileName: rateioPdfFileName || existing.rateioPdfFileName,
        boletoPdfFileName: boletoPdfFileName || existing.boletoPdfFileName,
        dataEnvio: new Date().toISOString()
      };

      // Atualizar
      await rateioBoletoModel.updateRateioBoletoEmail({
        id: rateioApartamento.rateio_boleto_email_id,
        ...updateData
      });
      
      result = { id: rateioApartamento.rateio_boleto_email_id, ...updateData };
    } else {
      // Criar novo registro
      const newEntry = await rateioBoletoModel.createRateioBoletoEmail({
        rateioPdf,
        boletoPdf,
        rateioPdfFileName,
        boletoPdfFileName,
        dataEnvio: new Date().toISOString()
      });

      // Vincular ao rateio_por_apartamento
      await rateioPorApartamentoModel.updateRateioBoletoEmailId(
        rateioApartamento.id,
        newEntry.id
      );
      
      result = newEntry;
    }

    return res.status(201).json(result);

  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

const getRateioBoletoEmailById = async (req, res) => {
  try {
    const { id } = req.params;
    const rateio = await rateioBoletoModel.getRateioBoletoEmailById(id);

    if (!rateio) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }
    return res.status(200).json(rateio);
  } catch (error) {
    console.error('Erro ao obter registro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateRateioBoletoEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rateioPdf,
      boletoPdf,
      rateioPdfFileName,
      boletoPdfFileName,
      dataEnvio
    } = req.body;

    const wasUpdated = await rateioBoletoModel.updateRateioBoletoEmail({
      id,
      rateioPdf: rateioPdf || null,
      boletoPdf: boletoPdf || null,
      rateioPdfFileName: rateioPdfFileName || null,
      boletoPdfFileName: boletoPdfFileName || null,
      dataEnvio
    });

    if (!wasUpdated) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }
    return res.status(200).json({ message: 'Registro atualizado' });
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const deleteRateioBoletoEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.query;

    if (!tipo || (tipo !== 'boleto' && tipo !== 'rateio')) {
      return res.status(400).json({ message: 'Tipo inválido. Use "boleto" ou "rateio".' });
    }

    const wasDeleted = await rateioBoletoModel.deleteRateioBoletoEmail(id, tipo);

    if (!wasDeleted) {
      return res.status(404).json({ message: 'Registro não encontrado ou já excluído.' });
    }

    return res.status(200).json({ message: 'Operação realizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


module.exports = {
  getAllRateioBoletoEmails,
  createRateioBoletoEmail,
  getRateioBoletoEmailById,
  updateRateioBoletoEmail,
  deleteRateioBoletoEmail
};
