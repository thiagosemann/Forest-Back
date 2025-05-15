const reservaModel = require('../../models/Airbnb/reservasAirbnbModel');

const getAllReservas = async (request, response) => {
  try {
    const reservas = await reservaModel.getAllReservas();
    return response.status(200).json(reservas);
  } catch (error) {
    console.error('Erro ao obter reservas:', error);
    return response.status(500).json({ error: 'Erro ao obter reservas' });
  }
};

const createReserva = async (request, response) => {
  try {
    const createdReserva = await reservaModel.createReserva(request.body);
    return response.status(201).json(createdReserva);
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    return response.status(409).json({ error: error.message });
  }
};

const getReservaById = async (request, response) => {
  try {
    const { id } = request.params;
    const reserva = await reservaModel.getReservaById(id);

    if (reserva) {
      return response.status(200).json(reserva);
    } else {
      return response.status(404).json({ message: 'Reserva não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao obter reserva:', error);
    return response.status(500).json({ error: 'Erro ao obter reserva' });
  }
};

const getReservasByApartamentoId = async (request, response) => {
  try {
    const { apartamentoId } = request.params;
    const reservas = await reservaModel.getReservasByApartamentoId(apartamentoId);
    return response.status(200).json(reservas);
  } catch (error) {
    console.error('Erro ao obter reservas por apartamento:', error);
    return response.status(500).json({ error: 'Erro ao obter reservas por apartamento' });
  }
};

const updateReserva = async (request, response) => {
  try {
    const { id } = request.params;
    const reserva = { ...request.body, id };

    const wasUpdated = await reservaModel.updateReserva(reserva);

    if (wasUpdated) {
      return response.status(200).json({ message: 'Reserva atualizada com sucesso' });
    } else {
      return response.status(404).json({ message: 'Reserva não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    return response.status(500).json({ error: 'Erro ao atualizar reserva' });
  }
};

const deleteReserva = async (request, response) => {
  try {
    const { id } = request.params;

    const wasDeleted = await reservaModel.deleteReserva(id);

    if (wasDeleted) {
      return response.status(200).json({ message: 'Reserva deletada com sucesso' });
    } else {
      return response.status(404).json({ message: 'Reserva não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar reserva:', error);
    return response.status(500).json({ error: 'Erro ao deletar reserva' });
  }
};
const getReservasPorPeriodo = async (request, response) => {
  try {
    const { start, end } = request.query;

    if (!start || !end) {
      return response.status(400).json({ 
        error: 'Datas inicial e final são obrigatórias' 
      });
    }

    const reservas = await reservaModel.getReservasPorPeriodo(start, end);
    return response.status(200).json(reservas);
    
  } catch (error) {
    console.error('Erro ao buscar reservas por período:', error);
    return response.status(500).json({ 
      error: 'Erro ao buscar reservas por período' 
    });
  }
};

const getReservasHoje = async (request, response) => {
  try {
    const reservas = await reservaModel.getReservasHoje();
    return response.status(200).json(reservas);
  } catch (error) {
    console.error('Erro ao buscar reservas de hoje:', error);
    return response.status(500).json({ error: 'Erro ao buscar reservas de hoje' });
  }
};

const getReservasAmanha = async (request, response) => {
  try {
    const reservas = await reservaModel.getReservasAmanha();
    return response.status(200).json(reservas);
  } catch (error) {
    console.error('Erro ao buscar reservas de amanha:', error);
    return response.status(500).json({ error: 'Erro ao buscar reservas de amanha' });
  }
};


const getProximasReservas = async (request, response) => {
  try {
    const reservas = await reservaModel.getProximasReservas();
    return response.status(200).json(reservas);
  } catch (error) {
    console.error('Erro ao buscar próximas reservas:', error);
    return response.status(500).json({ error: 'Erro ao buscar próximas reservas' });
  }
};

const getReservasFinalizadas = async (request, response) => {
  try {
    const reservas = await reservaModel.getReservasFinalizadas();
    return response.status(200).json(reservas);
  } catch (error) {
    console.error('Erro ao buscar reservas finalizadas:', error);
    return response.status(500).json({ error: 'Erro ao buscar reservas finalizadas' });
  }
};

const getReservasEmAndamento = async (request, response) => {
  try {
    const reservas = await reservaModel.getReservasEmAndamento();
    return response.status(200).json(reservas);
  } catch (error) {
    console.error('Erro ao buscar reservas em andamento:', error);
    return response.status(500).json({ error: 'Erro ao buscar reservas em andamento' });
  }
};
module.exports = {
  getAllReservas,
  createReserva,
  getReservaById,
  getReservasByApartamentoId,
  updateReserva,
  deleteReserva,
  getReservasPorPeriodo,
  getReservasHoje,
  getReservasAmanha,
  getProximasReservas,
  getReservasFinalizadas,
  getReservasEmAndamento
};