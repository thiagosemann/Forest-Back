const alocacaoModel = require('../../models/Airbnb/limpezaAlocacaoModel');

const { TIPO_RESERVA, TIPO_LIMPEZA_EXTRA } = alocacaoModel;

const normalizarUserId = (valor) => {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isNaN(n) ? null : n;
};

/**
 * Regra de bloqueio da escala: limpeza de hoje ou de data anterior que JÁ tem
 * faxineira só pode trocar de responsável com justificativa. Limpeza sem
 * responsável, ou de data futura, troca livremente.
 *
 * Devolve `{ erro }` para o controller responder sem gravar, ou `{ registrar }`
 * — uma função a ser chamada DEPOIS do update, que grava a linha na planilha.
 */
const prepararRegistroDeAlocacao = async ({ tipo, referencia_id, novoUserId, motivo, userId }) => {
  const atual = await alocacaoModel.getEstadoAtual(tipo, referencia_id);
  // Registro inexistente: deixa o update seguir e responder o 404 dele
  if (!atual) return {};

  // So limpeza de verdade entra no controle. Reserva cancelada ou bloqueio manual
  // nao virou faxina, e travar isso quebraria a conversao de cancelada em limpeza extra.
  if (tipo === TIPO_RESERVA && atual.description !== 'Reserved') return {};

  const anterior = normalizarUserId(atual.faxina_userId);
  const novo = normalizarUserId(novoUserId);
  if (anterior === novo) return {}; // responsável não mudou

  const justificativa = motivo ? String(motivo).trim() : '';
  const exigeJustificativa = anterior !== null && Boolean(Number(atual.data_passada));

  if (exigeJustificativa && !justificativa) {
    return {
      erro: {
        status: 409,
        error: 'Esta limpeza é de hoje ou de uma data anterior e já possui responsável. Libere a alteração informando o motivo.'
      }
    };
  }

  const motivoFinal = justificativa || (anterior === null
    ? 'Responsável definido na escala'
    : 'Troca de responsável em limpeza futura');

  return {
    registrar: () => alocacaoModel.registrarAlocacao({
      tipo,
      referencia_id,
      apartamento_id: atual.apartamento_id,
      faxina_userId_anterior: anterior,
      faxina_userId_novo: novo,
      user_id: userId || null,
      origem: 'MANUAL',
      motivo: motivoFinal
    })
  };
};

// ------------------------------- Rotas -------------------------------

const getTimeline = async (request, response) => {
  try {
    const { tipo, referenciaId } = request.params;
    if (!alocacaoModel.isTipoValido(tipo)) {
      return response.status(400).json({ error: 'Tipo inválido. Use RESERVA ou LIMPEZA_EXTRA.' });
    }
    // Limpezas alocadas antes desta planilha existir ganham aqui o primeiro registro
    await alocacaoModel.migrarAlocacaoLegado(tipo, referenciaId);
    const rows = await alocacaoModel.getTimeline(tipo, referenciaId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter timeline de alocações:', error);
    return response.status(500).json({ error: 'Erro ao obter timeline de alocações' });
  }
};

const getUltima = async (request, response) => {
  try {
    const { tipo, referenciaId } = request.params;
    if (!alocacaoModel.isTipoValido(tipo)) {
      return response.status(400).json({ error: 'Tipo inválido. Use RESERVA ou LIMPEZA_EXTRA.' });
    }
    const ultima = await alocacaoModel.getUltima(tipo, referenciaId);
    return response.status(200).json(ultima);
  } catch (error) {
    console.error('Erro ao obter última alocação:', error);
    return response.status(500).json({ error: 'Erro ao obter última alocação' });
  }
};

const getUltimasPorPeriodo = async (request, response) => {
  try {
    const { inicio, fim } = request.query;
    if (!inicio || !fim) {
      return response.status(400).json({ error: 'Informe inicio e fim (yyyy-MM-dd)' });
    }
    const rows = await alocacaoModel.getUltimasPorPeriodo(inicio, fim, request.empresaId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter alocações por período:', error);
    return response.status(500).json({ error: 'Erro ao obter alocações por período' });
  }
};

module.exports = {
  TIPO_RESERVA,
  TIPO_LIMPEZA_EXTRA,
  prepararRegistroDeAlocacao,
  getTimeline,
  getUltima,
  getUltimasPorPeriodo
};
