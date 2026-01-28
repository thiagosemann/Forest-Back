const apartamentoModel = require('../../models/Airbnb/apartamentosAirbnbModel');
const reservasModel = require('../../models/Airbnb/reservasAirbnbModel');

const getAllApartamentos = async (request, response) => {
  try {
    const { empresaId } = request;
    const apartamentos = await apartamentoModel.getAllApartamentosByEmpresa(empresaId);
    return response.status(200).json(apartamentos);
  } catch (error) {
    console.error('Erro ao obter apartamentos:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamentos' });
  }
};

const createApartamento = async (request, response) => {
  try {
    const { empresaId } = request;
    const createdApartamento = await apartamentoModel.createApartamento({ ...request.body, empresa_id: empresaId });
    return response.status(201).json(createdApartamento);
  } catch (error) {
    console.error('Erro ao criar apartamento:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getApartamentoById = async (request, response) => {
  try {
    const { id } = request.params;
    const { empresaId } = request;
    const apartamento = await apartamentoModel.getApartamentoByIdAndEmpresa(id, empresaId);

    if (apartamento) {
      return response.status(200).json(apartamento);
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamento' });
  }
};

const getApartamentoByCodProprietario = async (request, response) => {
  try {
    const { cod } = request.params;
    const apartamento = await apartamentoModel.getApartamentoByCodProprietario(cod);
    if (apartamento) {
      return response.status(200).json(apartamento);
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamento' });
  }
};

const getApartamentosByPredioId = async (request, response) => {
  try {
    const { predioId } = request.params;
    const { empresaId } = request;
    const apartamentos = await apartamentoModel.getApartamentosByPredioIdAndEmpresa(predioId, empresaId);
    return response.status(200).json(apartamentos);
  } catch (error) {
    console.error('Erro ao obter apartamentos por prédio:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamentos por prédio' });
  }
};

// Apartamentos inativos (is_active = 0) por empresa
const getApartamentosInativosByEmpresa = async (request, response) => {
  try {
    const { empresaId } = request;
    const apartamentos = await apartamentoModel.getApartamentosInativosByEmpresa(empresaId);
    return response.status(200).json(apartamentos);
  } catch (error) {
    console.error('Erro ao obter apartamentos inativos:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamentos inativos' });
  }
};

const updateApartamento = async (request, response) => {
  try {
    const { id } = request.params;
    const apartamento = { ...request.body, id };

    const wasUpdated = await apartamentoModel.updateApartamento(apartamento);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Apartamento atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar apartamento:', error);
    return response.status(500).json({ error: 'Erro ao atualizar apartamento' });
  }
};

const deleteApartamento = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await apartamentoModel.deleteApartamento(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Apartamento deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar apartamento:', error);
    return response.status(500).json({ error: 'Erro ao deletar apartamento' });
  }
};

const getVagaSelfieTemGaragem = async (request, response) => {
  try {
    const cod_reserva = request.query.cod_reserva || request.params.cod_reserva || request.body?.cod_reserva;

    if (!cod_reserva) {
      return response.status(400).json({ error: 'Parâmetro cod_reserva é obrigatório.' });
    }

    const reserva = await reservasModel.getReservaByCod(cod_reserva);
    if (!reserva) {
      return response.status(404).json({ error: 'Reserva não encontrada para o cod_reserva informado.' });
    }

    const apt_id = reserva.apartamento_id;
    if (!apt_id) {
      return response.status(404).json({ error: 'Reserva não possui apartamento vinculado.' });
    }

    const dados = await apartamentoModel.getVagaSelfieTemGaragem(apt_id);
    if (!dados) {
      return response.status(404).json({ error: 'Apartamento não encontrado.' });
    }

    return response.status(200).json(dados);
  } catch (error) {
    console.error('Erro ao obter vaga_garagem/pedir_selfie/tem_garagem:', error);
    return response.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};

const getApartamentoByReserva = async (request, response) => {
  try {
    const { cod_reserva } = request.params;

    // 1. Buscar a reserva pelo código
    const reserva = await reservasModel.getReservaByCod(cod_reserva);

    if (!reserva) {
      return response.status(404).json({ message: 'Reserva não encontrada' });
    }

    const { apartamento_id } = reserva;

    if (!apartamento_id) {
      return response.status(404).json({ message: 'Reserva não possui apartamento vinculado' });
    }

    // 2. Buscar o apartamento pelo ID
    const apartamento = await apartamentoModel.getApartamentoById(apartamento_id);

    if (apartamento) {
      return response.status(200).json(apartamento);
    } else {
      return response.status(404).json({ message: 'Apartamento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter apartamento por reserva:', error);
    return response.status(500).json({ error: 'Erro ao obter apartamento por reserva' });
  }
};

module.exports = {
  getAllApartamentos,
  createApartamento,
  getApartamentoById,
  getApartamentosByPredioId,
  getApartamentoByCodProprietario,
  updateApartamento,
  deleteApartamento,
  getVagaSelfieTemGaragem,
  getApartamentoByReserva,
  getApartamentosInativosByEmpresa
};