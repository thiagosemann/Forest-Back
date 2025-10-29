const credenciaisModel = require('../../models/Airbnb/credenciaisReservaModel');

const createCredencialReserva = async (request, response) => {
  try {
    const { reserva_id, cod_reserva, arquivoBase64 } = request.body;

    if (!reserva_id || !cod_reserva || !arquivoBase64) {
      return response.status(400).json({ error: 'reserva_id, cod_reserva e arquivoBase64 são obrigatórios' });
    }

    const created = await credenciaisModel.createCredencial({ reserva_id, cod_reserva, arquivoBase64 });
    return response.status(201).json(created);
  } catch (error) {
    console.error('Erro ao criar credencial da reserva:', error);
    return response.status(500).json({ error: 'Erro ao criar credencial da reserva' });
  }
};

const getCredencialById = async (request, response) => {
  try {
    const { id } = request.params;
    const cred = await credenciaisModel.getById(id);
    if (cred) return response.status(200).json(cred);
    return response.status(404).json({ message: 'Credencial não encontrada' });
  } catch (error) {
    console.error('Erro ao obter credencial por id:', error);
    return response.status(500).json({ error: 'Erro ao obter credencial' });
  }
};

const getCredenciaisByReservaId = async (request, response) => {
  try {
    const { reservaId } = request.params;
    const rows = await credenciaisModel.getByReservaId(reservaId);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter credenciais por reserva:', error);
    return response.status(500).json({ error: 'Erro ao obter credenciais por reserva' });
  }
};

const getCredenciaisByCodReserva = async (request, response) => {
  try {
    const { cod_reserva } = request.params;
    const rows = await credenciaisModel.getByCodReserva(cod_reserva);
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter credenciais por cod_reserva:', error);
    return response.status(500).json({ error: 'Erro ao obter credenciais por cod_reserva' });
  }
};

const deleteCredencial = async (request, response) => {
  try {
    const { id } = request.params;
    const wasDeleted = await credenciaisModel.deleteById(id);
    if (wasDeleted) return response.status(200).json({ message: 'Credencial deletada com sucesso' });
    return response.status(404).json({ message: 'Credencial não encontrada' });
  } catch (error) {
    console.error('Erro ao deletar credencial:', error);
    return response.status(500).json({ error: 'Erro ao deletar credencial' });
  }
};

const deleteCredenciaisByReserva = async (request, response) => {
  try {
    const { reservaId } = request.params;
    const wasDeleted = await credenciaisModel.deleteByReservaId(reservaId);
    if (wasDeleted) return response.status(200).json({ message: 'Credenciais da reserva deletadas' });
    return response.status(404).json({ message: 'Nenhuma credencial encontrada para essa reserva' });
  } catch (error) {
    console.error('Erro ao deletar credenciais por reserva:', error);
    return response.status(500).json({ error: 'Erro ao deletar credenciais por reserva' });
  }
};

const getAllCredenciais = async (request, response) => {
  try {
    const rows = await credenciaisModel.getAll();
    return response.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao obter todas as credenciais:', error);
    return response.status(500).json({ error: 'Erro ao obter credenciais' });
  }
};

module.exports = {
  createCredencialReserva,
  getCredencialById,
  getCredenciaisByReservaId,
  getCredenciaisByCodReserva,
  deleteCredencial,
  deleteCredenciaisByReserva,
  getAllCredenciais
};
