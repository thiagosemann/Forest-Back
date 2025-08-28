// controllers/ticketReembolsoController.js
const ticketModel = require('../../models/Airbnb/ticketReembolsoModel');
const mercadoPagoApi = require('../../controllers/Airbnb/mercadoPagoController');

// Buscar todos os tickets
const getAllReembolsos = async (_req, res) => {
  try {
    const tickets = await ticketModel.getAllReembolsos();
    return res.status(200).json(tickets);
  } catch (error) {
    console.error('Erro ao obter tickets:', error);
    return res.status(500).json({ error: 'Erro ao obter tickets' });
  }
};

// Buscar um ticket por ID
const getReembolsoById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await ticketModel.getReembolsoById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }
    return res.status(200).json(ticket);
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    return res.status(500).json({ error: 'Erro ao buscar ticket' });
  }
};

// Criar um novo ticket
const createReembolso = async (req, res) => {
  try {
    const { arquivos, ...dados } = req.body;

    // Gerar código aleatório
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    dados.auth = `${randomCode}`;

    // Calcula valor total para pagamento
    const valorTotal = (Number(dados.valor_mao_obra) || 0) + (Number(dados.valor_material) || 0);
    let linkPagamento = null;

    // Cria preferência MercadoPago se houver valor
    if (valorTotal > 0) {
      try {
        const mpRes = await mercadoPagoApi.criarPreferenciaReembolso({
          user_id: dados.user_id || null,
          apartamento_id: dados.apartamento_id,
          valorReais: valorTotal,
          auth: dados.auth
        });
        if (mpRes && mpRes.redirectUrl) {
          linkPagamento = mpRes.redirectUrl;
        }
      } catch (err) {
        console.error('Erro ao criar preferência MercadoPago:', err);
      }
    }

    // Cria o ticket no banco já com o link_pagamento
    dados.link_pagamento = linkPagamento;
    const result = await ticketModel.createReembolso(dados, arquivos);

    return res.status(201).json({ message: 'Ticket criado com sucesso', insertId: result.insertId, auth: dados.auth, link_pagamento: linkPagamento });
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    return res.status(500).json({ error: 'Erro ao criar ticket' });
  }
};

// Atualizar um ticket existente
const updateReembolso = async (req, res) => {
  try {
    const { id } = req.params;
    const { arquivos, ...dados } = req.body;
    const valorTotal = (Number(dados.valor_mao_obra) || 0) + (Number(dados.valor_material) || 0);

    // Se valorTotal > 0, cria/atualiza preferência MercadoPago e link_pagamento
    if (valorTotal > 0) {
      try {
        const mpRes = await mercadoPagoApi.criarPreferenciaReembolso({
          user_id: dados.user_id || null,
          apartamento_id: dados.apartamento_id,
          valorReais: valorTotal,
          auth: dados.auth
        });
        if (mpRes && mpRes.redirectUrl) {
          dados.link_pagamento = mpRes.redirectUrl;
        }
      } catch (err) {
        console.error('Erro ao criar preferência MercadoPago:', err);
      }
    }

    const result = await ticketModel.updateReembolso(id, dados, arquivos);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    return res.status(500).json({ error: 'Erro ao atualizar ticket' });
  }
};

// Deletar um ticket
const deleteReembolso = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ticketModel.deleteReembolso(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }
    return res.status(200).json({ message: 'Ticket deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    return res.status(500).json({ error: 'Erro ao deletar ticket' });
  }
};

// Buscar ticket por auth
const getTicketByAuth = async (req, res) => {
  try {
    const { auth } = req.params;
    const ticket = await ticketModel.getTicketByAuth(auth);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }
    // ticket.files já vem do model, mas garanta que está presente
    return res.status(200).json(ticket);
  } catch (error) {
    console.error('Erro ao buscar ticket por auth:', error);
    return res.status(500).json({ error: 'Erro ao buscar ticket por auth' });
  }
};

// Criar arquivo para ticket de reembolso
const createArquivoReembolso = async (req, res) => {
  try {
    const { reembolso_id, imagemBase64, type, file_name } = req.body;
    const result = await ticketModel.createArquivoReembolso(reembolso_id, imagemBase64, type, file_name);
    return res.status(201).json({ message: 'Arquivo criado com sucesso', insertId: result.insertId });
  } catch (error) {
    console.error('Erro ao criar arquivo:', error);
    return res.status(500).json({ error: 'Erro ao criar arquivo' });
  }
};

// Atualizar arquivo de ticket de reembolso
const updateArquivoReembolso = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const result = await ticketModel.updateArquivoReembolso(id, fields);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao atualizar arquivo:', error);
    return res.status(500).json({ error: 'Erro ao atualizar arquivo' });
  }
};

// Deletar arquivo de ticket de reembolso
const deleteArquivoReembolso = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ticketModel.deleteArquivoReembolso(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }
    return res.status(200).json({ message: 'Arquivo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return res.status(500).json({ error: 'Erro ao deletar arquivo' });
  }
};

module.exports = {
  getAllReembolsos,
  getReembolsoById,
  createReembolso,
  updateReembolso,
  deleteReembolso,
  getTicketByAuth, // exporta nova função
  createArquivoReembolso,
  updateArquivoReembolso,
  deleteArquivoReembolso,
};
