const whatsControl  = require('../../WhatsApp/whats_Controle');
const reservasModel = require('../../models/Airbnb/reservasAirbnbModel');

const sendMensagemCadastroViaLink = async (req, res) => {
  try {
    const {reservaId } = req.body;
    const reserva = await reservasModel.getReservaById(reservaId);
    if (!reserva) {
        return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    let tipoSite = '';
    if(reserva.link_reserva.toLowerCase().includes('airbnb')){
        tipoSite = 'Recebemos sua reserva através do Airbnb';
    }else if(reserva.link_reserva.toLowerCase().includes('booking')){
        tipoSite = 'Recebemos sua reserva através do Booking';
    } else{
        tipoSite = 'Recebemos sua reserva:';
    }
    await whatsControl.criarMensagemCadastroViaLink(
        { 
        telefone: reserva.telefone_principal,
        linkCadastro: `https://www.apartamentosforest.com.br/reserva/${reserva.cod_reserva}`,
        dataEntrada: reserva.start_date,
        dataSaida: reserva.end_data,
        tipoSite:tipoSite 
    });

    return res.status(201).json({ mensagem: 'Link de cadastro enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
};


module.exports = {
  sendMensagemCadastroViaLink
};
