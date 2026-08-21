const observacoesModel = require('../../models/Airbnb/observacoesProprietarioModel');

const createObservacao = async (request, response) => {
  try {
    const { proprietario_id, apartamento_id, texto } = request.body;

    if (!proprietario_id) {
      return response.status(400).json({ error: 'proprietario_id é obrigatório' });
    }
    if (!texto || !String(texto).trim()) {
      return response.status(400).json({ error: 'O texto da observação não pode ser vazio' });
    }

    const created = await observacoesModel.createObservacao({
      proprietario_id,
      apartamento_id: apartamento_id || null,
      user_id: request.userId, // vem do verifyToken
      texto: String(texto).trim()
    });
    return response.status(201).json(created);
  } catch (error) {
    console.error('Erro ao criar observação do proprietário:', error);
    return response.status(500).json({ error: 'Erro ao criar observação do proprietário' });
  }
};

const getObservacoesByProprietarioId = async (request, response) => {
  try {
    const { proprietarioId } = request.params;
    const rows = await observacoesModel.getByProprietarioId(proprietarioId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter observações do proprietário:', error);
    return response.status(500).json({ error: 'Erro ao obter observações do proprietário' });
  }
};

// A tela de apartamentos mostra a timeline do(s) proprietário(s) do apartamento
const getObservacoesByApartamentoId = async (request, response) => {
  try {
    const { apartamentoId } = request.params;
    const rows = await observacoesModel.getByApartamentoId(apartamentoId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter observações por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter observações por apartamento' });
  }
};

// Usado pela tela de apartamentos para saber a quem atribuir uma nova nota
const getProprietariosDoApartamento = async (request, response) => {
  try {
    const { apartamentoId } = request.params;
    const rows = await observacoesModel.getProprietariosDoApartamento(apartamentoId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter proprietários do apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter proprietários do apartamento' });
  }
};

const getUltimaObservacao = async (request, response) => {
  try {
    const { proprietarioId } = request.params;
    const ultima = await observacoesModel.getUltimaByProprietarioId(proprietarioId);
    return response.status(200).json(ultima);
  } catch (error) {
    console.error('Erro ao obter última observação do proprietário:', error);
    return response.status(500).json({ error: 'Erro ao obter última observação do proprietário' });
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
    // Só o autor pode alterar o próprio registro — a timeline é histórico
    if (atual.user_id !== null && atual.user_id !== request.userId) {
      return response.status(403).json({ error: 'Apenas o autor pode editar esta observação' });
    }

    const atualizada = await observacoesModel.updateObservacao(id, String(texto).trim());
    return response.status(200).json(atualizada);
  } catch (error) {
    console.error('Erro ao atualizar observação do proprietário:', error);
    return response.status(500).json({ error: 'Erro ao atualizar observação do proprietário' });
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
    console.error('Erro ao deletar observação do proprietário:', error);
    return response.status(500).json({ error: 'Erro ao deletar observação do proprietário' });
  }
};

module.exports = {
  createObservacao,
  getObservacoesByProprietarioId,
  getObservacoesByApartamentoId,
  getProprietariosDoApartamento,
  getUltimaObservacao,
  updateObservacao,
  deleteObservacao
};
