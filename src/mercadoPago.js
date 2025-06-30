const { MercadoPagoConfig, Preference } = require('mercadopago');
const pagamentoModel = require('./models/Airbnb/pagamento_por_reserva_extraModel');
const usersModel = require('./models/Airbnb/usersAirbnbModel');
const apartamentosModel = require('./models/Airbnb/apartamentosAirbnbModel');
const reservasModel = require('./models/Airbnb/reservasAirbnbModel');
const whatsControle = require('./WhatsApp/whats_Controle')
const axios = require('axios');
require('dotenv').config();

// Configuração do MercadoPago
const client = new MercadoPagoConfig({ accessToken: process.env.access_token });
const preference = new Preference(client);

/**
 * Cria preferência de pagamento e envia link via WhatsApp para early check-in
 */
async function criarPreferencia(req, res) {
  try {
    const { user_id, apartamento_id, cod_reserva, valorReais, tipo } = req.body;

    // Busca dados do usuário e do apartamento
    const user = await usersModel.getUser(user_id);
    const telefoneHospede = user.Telefone;
    const nomeHospede = user.first_name || user.name;
    const emailComprador = user.email || null;

    const apartamento = await apartamentosModel.getApartamentoById(apartamento_id);
    const message = `Early Checkin - ${apartamento.nome} / Reserva: ${cod_reserva}`;

    const body = {
      additional_info: message,
      auto_return: 'approved',
      back_urls: {
        failure: 'https://www.foreasy.com.br/content',
        pending: 'https://www.foreasy.com.br/content',
        success: 'https://www.foreasy.com.br/content'
      },
      items: [{
        id: cod_reserva,
        title: message,
        category_id: 'others',
        currency_id: 'BRL',
        description: message,
        quantity: 1,
        unit_price: valorReais
      }],
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [
          { id: 'prepaid_card' },
          { id: 'ticket' },
          { id: 'atm' }
        ]
      },
      marketplace: 'NONE',
      metadata: { user_id, email_comprador: emailComprador, apartamento_id, cod_reserva, valor_real: valorReais, tipo },
      operation_type: 'regular_payment',
      site_id: 'MLB'
    };

    const { init_point: redirectUrl } = await preference.create({ body });

    // Responde imediatamente ao front
    res.json({ redirectUrl });

    // Envia link de pagamento via WhatsApp (background)
    whatsControle.envioPagamentoEarly({
      //telefone_hospede: telefoneHospede,
      telefone_hospede: telefoneHospede,
      nome: nomeHospede,
      apartamento: apartamento.nome,
      cod_reserva,
      valor: valorReais,
      linkPagamento: redirectUrl
    }).catch(err => console.error('[ERRO] envioPagamentoEarly:', err));

  } catch (error) {
    console.error('Erro ao criar preferência MP:', error);
    res.status(500).json({ error: 'Não foi possível criar preferência.' });
  }
}


async function processarWebhookMercadoPago(req, res) {
  try {
    const { data } = req.body;
    const paymentId = data.id;

    const url = `https://api.mercadopago.com/v1/payments/${paymentId}?access_token=${process.env.access_token}`;
    const { data: paymentInfo, status } = await axios.get(url, { timeout: 10000 });

    if (status !== 200 || paymentInfo.status !== 'approved') {
      return res.status(400).send('Pagamento não aprovado ou erro MP');
    }
    console.log(data)
    const md = paymentInfo.metadata || {};
    // Busca reserva usando código
    const reserva = await reservasModel.getReservaByCod(md.cod_reserva);

    const dateCriado = paymentInfo.date_created
      ? paymentInfo.date_created.slice(0, 19).replace('T', ' ')
      : new Date().toISOString().slice(0, 19).replace('T', ' ');

    const payment = {
      user_id:        md.user_id,
      email_comprador: md.email_comprador,
      valor_total:    paymentInfo.transaction_amount,
      tipo_pagamento: paymentInfo.payment_type_id,
      date_criado:    dateCriado,
      valor_real:     md.valor_real,
      tipo:           md.tipo,
      reserva_id:     reserva.id,
      apartamento_id: md.apartamento_id,
      cod_reserva:    md.cod_reserva
    };

    await pagamentoModel.criarPagamentoPorReservaExtra(payment);
    const apartamento = await apartamentosModel.getApartamentoById(md.apartamento_id);
    const objeto={
      
    }
    whatsControle.envioEarlyPago({
      apartamento_name:apartamento.nome
    }).catch(err => console.error('[ERRO] envioPagamentoEarly:', err));
    
    return res.status(200).send('Webhook MP processado com sucesso.');
  }
  catch (err) {
    console.error('Erro no webhook MP:', err);
    return res.status(500).send('Falha ao processar webhook.');
  }
}

module.exports = { criarPreferencia, processarWebhookMercadoPago };
