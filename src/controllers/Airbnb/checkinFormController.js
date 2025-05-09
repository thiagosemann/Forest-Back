const checkinModel = require('../../models/Airbnb/checkinFormModel');

const getAllCheckins = async (request, response) => {
  try {
    const checkins = await checkinModel.getAllCheckins();
    return response.status(200).json(checkins);
  } catch (error) {
    console.error('Erro ao obter check-ins:', error);
    return response.status(500).json({ error: 'Erro ao obter check-ins' });
  }
};

const createCheckin = async (request, response) => {
  try {
    const createdCheckin = await checkinModel.createCheckin(request.body);
    return response.status(201).json(createdCheckin);
  } catch (error) {
    console.error('Erro ao criar check-in:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getCheckinById = async (request, response) => {
  try {
    const { id } = request.params;
    const checkin = await checkinModel.getCheckinById(id);

    if (checkin) {
      return response.status(200).json(checkin);
    } else {
      return response.status(404).json({ message: 'Check-in não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter check-in:', error);
    return response.status(500).json({ error: 'Erro ao obter check-in' });
  }
};

const getCheckinsByReservaId = async (request, response) => {
  try {
    const { reservaId } = request.params;
    const checkins = await checkinModel.getCheckinsByReservaId(reservaId);
    return response.status(200).json(checkins);
  } catch (error) {
    console.error('Erro ao obter check-ins por reserva:', error);
    return response.status(500).json({ error: 'Erro ao obter check-ins por reserva' });
  }
};

const updateCheckin = async (request, response) => {
  try {
    const { id } = request.params;
    const checkin = { ...request.body, id };

    const wasUpdated = await checkinModel.updateCheckin(checkin);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Check-in atualizado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Check-in não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar check-in:', error);
    return response.status(500).json({ error: 'Erro ao atualizar check-in' });
  }
};

const deleteCheckin = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await checkinModel.deleteCheckin(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Check-in deletado com sucesso' });
    } else {
      return response.status(404).json({ message: 'Check-in não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar check-in:', error);
    return response.status(500).json({ error: 'Erro ao deletar check-in' });
  }
};

const getCheckinByReservaIdOrCodReserva = async (req, res) => {
    const { reservaId, codReserva } = req.params;
  
    try {
      const checkin = await checkinModel.getCheckinByReservaIdOrCodReserva(reservaId, codReserva);
  
      if (checkin) {
        res.status(200).json(checkin);
      } else {
        res.status(404).json({ message: 'Check-in não encontrado.' });
      }
    } catch (error) {
      console.error('Erro ao buscar check-in:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  };

  const getCheckinsByUserId = async (request, response) => {
    try {
      const { userId } = request.params;
      const checkins = await checkinModel.getCheckinsByUserId(userId);
      return response.status(200).json(checkins);
    } catch (error) {
      console.error('Erro ao obter check-ins por usuário:', error);
      return response.status(500).json({ error: 'Erro ao obter check-ins por usuário' });
    }
  };
  

module.exports = {
  getAllCheckins,
  createCheckin,
  getCheckinById,
  getCheckinsByReservaId,
  updateCheckin,
  deleteCheckin,
  getCheckinByReservaIdOrCodReserva,
  getCheckinsByUserId
};
