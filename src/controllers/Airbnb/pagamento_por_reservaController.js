const pagamentoModel = require('../../models/Airbnb/pagamento_por_reservaModel');

// 1) Listar todos os pagamentos
const getAllPagamentos = async (req, res) => {
  try {
    const pagamentos = await pagamentoModel.getAllPagamentos();
    return res.status(200).json(pagamentos);
  } catch (error) {
    console.error('Erro ao obter pagamentos:', error);
    return res.status(500).json({ error: 'Erro ao obter pagamentos' });
  }
};

// 2) Buscar pagamento por ID
const getPagamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pagamento = await pagamentoModel.getPagamentoById(id);

    if (!pagamento) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }

    return res.status(200).json(pagamento);
  } catch (error) {
    console.error('Erro ao obter pagamento:', error);
    return res.status(500).json({ error: 'Erro ao obter pagamento' });
  }
};

// 3) Criar um novo pagamento
const createPagamento = async (req, res) => {
  try {
    const dataObj = req.body;
    const { insertId } = await pagamentoModel.createPagamento(dataObj);
    return res.status(201).json({ pagamentoId: insertId });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
};

// 4) Atualizar um pagamento
const updatePagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const dataObj = { id: Number(id), ...req.body };
    const wasUpdated = await pagamentoModel.updatePagamento(dataObj);

    if (wasUpdated) {
      return res.status(200).json({ message: 'Pagamento atualizado com sucesso' });
    } else {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    return res.status(500).json({ error: 'Erro ao atualizar pagamento' });
  }
};

// 5) Deletar pagamento
const deletePagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const wasDeleted = await pagamentoModel.deletePagamento(id);

    if (wasDeleted) {
      return res.status(200).json({ message: 'Pagamento deletado com sucesso' });
    } else {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);
    return res.status(500).json({ error: 'Erro ao deletar pagamento' });
  }
};

// 6) Buscar por código de reserva
const getByCodReserva = async (req, res) => {
  try {
    const { cod_reserva } = req.params;
    const pagamentos = await pagamentoModel.getByCodReserva(cod_reserva);
    return res.status(200).json(pagamentos);
  } catch (error) {
    console.error('Erro ao buscar por cod_reserva:', error);
    return res.status(500).json({ error: 'Erro ao buscar pagamento por código' });
  }
};

// 7) Buscar por lista de códigos de reserva
const getByCodReservaList = async (req, res) => {
  try {
    const { lista } = req.body; // Ex: { lista: ['ABC123', 'XYZ789'] }
    if (!Array.isArray(lista)) {
      return res.status(400).json({ error: 'A lista de códigos deve ser um array.' });
    }

    const pagamentos = await pagamentoModel.getByCodReservaList(lista);
    return res.status(200).json(pagamentos);
  } catch (error) {
    console.error('Erro ao buscar lista de pagamentos:', error);
    return res.status(500).json({ error: 'Erro ao buscar lista de códigos de reserva' });
  }
};

// 8) Buscar todos os pagamentos de um apartamento
const getByApartamentoId = async (req, res) => {
  try {
    const { apartamento_id } = req.params;
    const pagamentos = await pagamentoModel.getByApartamentoId(apartamento_id);
    return res.status(200).json(pagamentos);
  } catch (error) {
    console.error('Erro ao buscar pagamentos por apartamento_id:', error);
    return res.status(500).json({ error: 'Erro ao buscar por apartamento' });
  }
};

module.exports = {
  getAllPagamentos,
  getPagamentoById,
  createPagamento,
  updatePagamento,
  deletePagamento,
  getByCodReserva,
  getByCodReservaList,
  getByApartamentoId
};
