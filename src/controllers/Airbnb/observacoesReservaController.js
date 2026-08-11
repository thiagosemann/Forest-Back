const observacoesModel = require('../../models/Airbnb/observacoesReservaModel');

const createObservacao = async (request, response) => {
  try {
    const { reserva_id, cod_reserva, texto } = request.body;

    if (!reserva_id || !cod_reserva) {
      return response.status(400).json({ error: 'reserva_id e cod_reserva são obrigatórios' });
    }
    if (!texto || !String(texto).trim()) {
      return response.status(400).json({ error: 'O texto da observação não pode ser vazio' });
    }

    const created = await observacoesModel.createObservacao({
      reserva_id,
      cod_reserva,
      user_id: request.userId, // vem do verifyToken
      texto: String(texto).trim()
    });
    return response.status(201).json(created);
  } catch (error) {
    console.error('Erro ao criar observação da reserva:', error);
    return response.status(500).json({ error: 'Erro ao criar observação da reserva' });
  }
};

const getObservacoesByReservaId = async (request, response) => {
  try {
    const { reservaId } = request.params;
    // Reservas anteriores à timeline guardavam a nota em `reservas.Observacoes`.
    // Na primeira abertura do modal esse texto é convertido no primeiro registro.
    await observacoesModel.migrarObservacaoLegado(reservaId);
    const rows = await observacoesModel.getByReservaId(reservaId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter observações por reserva:', error);
    return response.status(500).json({ error: 'Erro ao obter observações por reserva' });
  }
};

const getObservacoesByCodReserva = async (request, response) => {
  try {
    const { cod_reserva } = request.params;
    const rows = await observacoesModel.getByCodReserva(cod_reserva);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter observações por cod_reserva:', error);
    return response.status(500).json({ error: 'Erro ao obter observações por cod_reserva' });
  }
};

const getUltimaObservacao = async (request, response) => {
  try {
    const { reservaId } = request.params;
    const ultima = await observacoesModel.getUltimaByReservaId(reservaId);
    return response.status(200).json(ultima);
  } catch (error) {
    console.error('Erro ao obter última observação:', error);
    return response.status(500).json({ error: 'Erro ao obter última observação' });
  }
};

const updateObservacao = async (request, response) => {
  try {
    const { id } = request.params;
    const { texto } = request.body;

    if (!texto || !String(texto).trim()) {
      return response.status(400).json({ error: 'O texto da observação não pode ser vazio' });
    }

    const atual = await observacoesModel.getRawById(id);
    if (!atual) {
      return response.status(404).json({ message: 'Observação não encontrada' });
    }
    // Só o autor pode alterar o próprio registro — a timeline é histórico.
    // Exceção: registros migrados do campo antigo não têm autor (user_id NULL).
    if (atual.user_id !== null && atual.user_id !== request.userId) {
      return response.status(403).json({ error: 'Apenas o autor pode editar esta observação' });
    }

    const atualizada = await observacoesModel.updateObservacao(id, String(texto).trim());
    return response.status(200).json(atualizada);
  } catch (error) {
    console.error('Erro ao atualizar observação:', error);
    return response.status(500).json({ error: 'Erro ao atualizar observação' });
  }
};

const deleteObservacao = async (request, response) => {
  try {
    const { id } = request.params;

    const atual = await observacoesModel.getRawById(id);
    if (!atual) {
      return response.status(404).json({ message: 'Observação não encontrada' });
    }
    if (atual.user_id !== null && atual.user_id !== request.userId) {
      return response.status(403).json({ error: 'Apenas o autor pode excluir esta observação' });
    }

    await observacoesModel.deleteObservacao(id);
    return response.status(200).json({ message: 'Observação removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar observação:', error);
    return response.status(500).json({ error: 'Erro ao deletar observação' });
  }
};

module.exports = {
  createObservacao,
  getObservacoesByReservaId,
  getObservacoesByCodReserva,
  getUltimaObservacao,
  updateObservacao,
  deleteObservacao
};
