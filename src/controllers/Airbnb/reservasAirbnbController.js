const reservaModel = require('../../models/Airbnb/reservasAirbnbModel');
const usersModel = require('../../models/Airbnb/usersAirbnbModel');
const whatsControle   = require('../../WhatsApp/whats_Controle');
const apartamentoModel = require('../../models/Airbnb/apartamentosAirbnbModel');
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
    if(reserva.faxina_userId !=null){
    const user = await usersModel.getUser(reserva.faxina_userId);
    let diaDaSemana = new Date(reserva.end_data).toLocaleDateString('pt-BR', { weekday: 'long' });
    diaDaSemana = diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1);
    const hoje = new Date();
    const today = hoje.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    let reservasHoje = await reservaModel.getReservasPorPeriodoByApartamentoID(reserva.apartamento_id, today, today);
    let entramHoje = reservasHoje.length > 0 ? true : false;
      whatsControle.criarMensagemSelecionadaComoTerceirizadaLimpeza({
        apartamento_name: reserva.apartamento_nome,
        checkin: reserva.end_data,
        entramHoje:entramHoje,
        senha_porta: reserva.apartamento_senha,
        telefone:'5541991017913',
        //telefone: user.Telefone,
        diaDaSemana: diaDaSemana
      });
    }
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


const getFaxinasPorPeriodo = async (request, response) => {
  try {
    const { start, end } = request.query;
    if (!start || !end) {
      return response.status(400).json({ 
        error: 'Datas inicial e final são obrigatórias' 
      });
    }

    const reservas = await reservaModel.getFaxinasPorPeriodo(start, end);
    return response.status(200).json(reservas);
    
  } catch (error) {
    console.error('Erro ao buscar reservas por período:', error);
    return response.status(500).json({ 
      error: 'Erro ao buscar reservas por período' 
    });
  }
};

const getReservasPorPeriodoCalendario = async (request, response) => {
  try {
    const { start, end } = request.query;
    if (!start || !end) {
      return response.status(400).json({
        error: 'Datas inicial (start) e final (end) são obrigatórias'
      });
    }

    const reservas = await reservaModel.getReservasPorPeriodoCalendario(start, end);
    return response.status(200).json(reservas);

  } catch (error) {
    console.error('Erro ao buscar reservas por período completo:', error);
    return response.status(500).json({
      error: 'Erro ao buscar reservas por período completo'
    });
  }
};
const getReservasCanceladasHoje = async (request, response) => {
  try {
    const reservas = await reservaModel.getReservasCanceladasHoje();
    return response.status(200).json(reservas);
  } catch (error) {
    console.error('Erro ao obter reservas canceladas de hoje:', error);
    return response.status(500).json({ error: 'Erro ao obter reservas canceladas de hoje' });
  }
};

const getReservasPorPeriodoCalendarioPorApartamento = async (request, response) => {
  try {
    const { apartamentoId } = request.params;
    const { start, end } = request.query;

    if (!apartamentoId) {
      return response.status(400).json({ error: 'apartamentoId é obrigatório' });
    }
    if (!start || !end) {
      return response.status(400).json({ error: 'Datas inicial (start) e final (end) são obrigatórias' });
    }

    const reservas = await reservaModel.getReservasPorPeriodoCalendarioPorApartamento(start, end, apartamentoId);
    return response.status(200).json(reservas);

  } catch (error) {
    console.error('Erro ao buscar reservas por período/apartamento:', error);
    return response.status(500).json({ error: 'Erro ao buscar reservas por período/apartamento' });
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
  getFaxinasPorPeriodo,
  getReservasPorPeriodoCalendario,
  getReservasCanceladasHoje,
  getReservasPorPeriodoCalendarioPorApartamento
};
