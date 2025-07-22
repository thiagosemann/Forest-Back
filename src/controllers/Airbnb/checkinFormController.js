const checkinModel = require('../../models/Airbnb/checkinFormModel');
const reservasModel = require('../../models/Airbnb/reservasAirbnbModel');
const apartamentoModel = require('../../models/Airbnb/apartamentosAirbnbModel');
const whatsControle   = require('../../WhatsApp/whats_Controle');


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
    let objeto={
      cod_reserva:request.body.cod_reserva,
      telefone_hospede: request.body.Telefone
    }
     whatsControle.envioCadastroConcluido(objeto);

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
    let objeto={
      cod_reserva:request.body.cod_reserva,
      telefone_hospede: request.body.Telefone
    }
     whatsControle.envioCadastroConcluido(objeto);
    if (wasUpdated) {
      // Chamar função do whats
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
  
const envioPorCheckins = async (request, response) => {
  try {
    const { checkinIds } = request.body;
    if (!Array.isArray(checkinIds) || checkinIds.length === 0) {
      return response
        .status(400)
        .json({ error: 'checkinIds deve ser um array não-vazio' });
    }

    // Para cada ID, busca o check-in e dispara o envio
    for (const checkinId of checkinIds) {
      const checkin = await checkinModel.getCheckinById(checkinId);
      const reserva = await reservasModel.getReservaById(checkin.reserva_id);
      const apartamento = await apartamentoModel.getApartamentoById(reserva.apartamento_id)
      if (!checkinId) {
        console.warn(`Check-in ${checkinId} não encontrado`);
        continue;
      }
      let objeto={
        dataEntrada:reserva.start_date,
        dataSaida:   reserva.end_data,  // ou reserva.end_date, conforme o nome correto
        apartamento_name: apartamento.nome,
        name:            checkin.first_name,
        cpf:             checkin.CPF,
        telefone_hospede:        checkin.Telefone,
        imagemBase64:        checkin.imagemBase64,
      }    

       await whatsControle.envioForest(objeto);
    }

    return response
      .status(200)
      .json({ message: 'Processamento de envioPorCheckins concluído.' });
  } catch (error) {
    console.error('Erro em envioPorCheckins:', error);
    return response
      .status(500)
      .json({ error: 'Erro interno ao processar o envio.' });
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
  getCheckinsByUserId,
  envioPorCheckins
};
