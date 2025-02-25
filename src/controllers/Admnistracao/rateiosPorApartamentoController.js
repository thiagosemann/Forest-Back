const rateiosPorApartamentoModel = require('../../models/Administracao/rateioPorApartamentoModel');

const getAllRateiosPorApartamento = async (request, response) => {
  try {
    const rateios = await rateiosPorApartamentoModel.getAllRateiosPorApartamento();
    return response.status(200).json(rateios);
  } catch (error) {
    console.error('Erro ao obter rateios por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter rateios por apartamento' });
  }
};

const createRateioPorApartamento = async (data) => {
  try {
    const createdRateio = await rateiosPorApartamentoModel.createRateioPorApartamento(data);
    return createdRateio;
  } catch (error) {
    console.error('Erro ao criar rateio por apartamento:', error);
    throw new Error(error.message);
  }
};

const getRateioPorApartamentoById = async (request, response) => {
  try {
    const { id } = request.params;
    const rateio = await rateiosPorApartamentoModel.getRateioPorApartamentoById(id);

    if (rateio) {
      return response.status(200).json(rateio);
    } else {
      return response.status(404).json({ message: 'Rateio por apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter rateio por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter rateio por apartamento' });
  }
};

const getRateioPorApartamentoByAptId = async (request, response) => {
  try {
    const { apartamentoId } = request.params;
    const rateio = await rateiosPorApartamentoModel.getRateioPorApartamentoByAptId(apartamentoId);

    if (rateio) {
      return response.status(200).json(rateio);
    } else {
      return response.status(404).json({ message: 'Rateio por apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter rateio por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter rateio por apartamento' });
  }
};

const getRateiosPorApartamentoByRateioId = async (request, response) => {
  try {
    const { rateioId } = request.params;
    const rateios = await rateiosPorApartamentoModel.getRateiosPorRateioId(rateioId);
    return response.status(200).json(rateios);
  } catch (error) {
    console.error('Erro ao obter rateios por apartamento por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter rateios por apartamento por prédio' });
  }
};

const updateRateioPorApartamento = async (request, response) => {
  try {
    const { id } = request.params;
    const rateio = { ...request.body, id };

    const wasUpdated = await rateiosPorApartamentoModel.updateRateioPorApartamento(rateio);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Rateio por apartamento atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Rateio por apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar rateio por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao atualizar rateio por apartamento' });
  }
};

const deleteRateioPorApartamento = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await rateiosPorApartamentoModel.deleteRateioPorApartamento(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Rateio por apartamento deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Rateio por apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar rateio por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao deletar rateio por apartamento' });
  }
};

const updateDataPagamento = async (request, response) => {
  try {
    const { id } = request.params;
    const { data_pagamento } = request.body;

    if (!data_pagamento) {
      return response.status(400).json({ error: 'O campo data_pagamento é obrigatório' });
    }

    const wasUpdated = await rateiosPorApartamentoModel.updateDataPagamentoById(id, data_pagamento);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Data de pagamento atualizada com sucesso' });
    } else {
      return response.status(404).json({ message: 'Rateio por apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar data de pagamento:', error);
    return response.status(500).json({ error: 'Erro ao atualizar data de pagamento' });
  }
};

const getRateiosNaoPagosPorPredioId = async (request, response) => {
  try {
    const { predioId } = request.params;

    if (!predioId) {
      return response.status(400).json({ error: 'O campo predioId é obrigatório' });
    }

    const rateios = await rateiosPorApartamentoModel.getRateiosNaoPagosPorPredioId(predioId);

    if (rateios.length > 0) {
      return response.status(200).json(rateios);
    } else {
      return response.status(404).json({ message: 'Nenhum rateio encontrado para o prédio especificado' });
    }
  } catch (error) {
    console.error('Erro ao obter rateios por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter rateios por prédio' });
  }
};

// Nova função para atualizar a data de pagamento
const atualizarDataPagamento = async (request, response) => {
  try {
    const { pagamentosConsolidados } = request.body; // Recebe o array de pagamentos consolidados

    if (!Array.isArray(pagamentosConsolidados)) {
      return response.status(400).json({ error: 'O corpo da requisição deve conter um array de pagamentos consolidados.' });
    }

    // Chama a função do modelo para atualizar a data de pagamento
    await rateiosPorApartamentoModel.atualizarDataPagamento(pagamentosConsolidados);

    return response.status(200).json({ message: 'Data de pagamento atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar data de pagamento:', error);
    return response.status(500).json({ error: 'Erro ao atualizar data de pagamento' });
  }
};

// Nova função: Rateios Gerados e Pagos no Mês Correto
const getRateiosGeradosEPagosNoMesCorreto = async (request, response) => {
  try {
    const { predioId, mes, ano } = request.params;
    if (!predioId || !mes || !ano) {
      return response.status(400).json({ error: 'Os campos predioId, mes e ano são obrigatórios' });
    }

    const rateios = await rateiosPorApartamentoModel.getRateiosGeradosEPagosNoMesCorreto(predioId, mes, ano);

    if (rateios && rateios.length > 0) {
      return response.status(200).json(rateios);
    } else {
      return response.status(404).json({ message: 'Nenhum rateio encontrado com geração e pagamento no mesmo mês.' });
    }
  } catch (error) {
    console.error('Erro ao buscar rateios gerados e pagos no mês correto:', error);
    return response.status(500).json({ error: 'Erro ao buscar rateios gerados e pagos no mês correto' });
  }
};

// Nova função: Rateios Pagos com Geração em Meses Diferentes
const getRateiosPagosGeradosEmMesesDiferentes = async (request, response) => {
  try {
    const { predioId, mes, ano } = request.params;
    if (!predioId || !mes || !ano) {
      return response.status(400).json({ error: 'Os campos predioId, mes e ano são obrigatórios' });
    }

    const rateios = await rateiosPorApartamentoModel.getRateiosPagosGeradosEmMesesDiferentes(predioId, mes, ano);

    if (rateios && rateios.length > 0) {
      return response.status(200).json(rateios);
    } else {
      return response.status(404).json({ message: 'Nenhum rateio encontrado com pagamento no mês informado e geração em meses diferentes.' });
    }
  } catch (error) {
    console.error('Erro ao buscar rateios pagos com geração em meses diferentes:', error);
    return response.status(500).json({ error: 'Erro ao buscar rateios pagos com geração em meses diferentes' });
  }
};

module.exports = {
  getAllRateiosPorApartamento,
  createRateioPorApartamento,
  getRateioPorApartamentoById,
  getRateiosPorApartamentoByRateioId,
  updateRateioPorApartamento,
  deleteRateioPorApartamento,
  getRateioPorApartamentoByAptId,
  updateDataPagamento,
  getRateiosNaoPagosPorPredioId,
  atualizarDataPagamento,
  getRateiosGeradosEPagosNoMesCorreto,
  getRateiosPagosGeradosEmMesesDiferentes
};
