const { MercadoPagoConfig, Preference } = require('mercadopago');
const PaymentModel = require('./models/Airbnb/paymentModel');
const usersModel = require('./models/Airbnb/usersAirbnbModel')
const apartamentosModel = require('./models/Airbnb/apartamentosAirbnbModel')


const axios = require('axios');
require('dotenv').config();


// Configuração do MercadoPago
const client = new MercadoPagoConfig({ accessToken: process.env.access_token });
const preference = new Preference(client);

// Função para criar a preferência e obter o link de redirecionamento
async function criarPreferencia(req, res) {
  try {
     const {user_id,apartamento_id,cod_reserva,valorReais} = req.body;
     const apartamento = await apartamentosModel.getApartamentoById(apartamento_id);
     const message = `Early Checkin - ${apartamento.nome} código da reserva: ${cod_reserva}`;
     const body = {
      additional_info: message,
      auto_return: 'approved',
      back_urls: {
        failure: 'https://www.foreasy.com.br/content',
        pending: 'https://www.foreasy.com.br/content',
        success: 'https://www.foreasy.com.br/content'
      },
      date_created: new Date().toISOString(),
      items: [
        {
          id: '001',
          title: message,
          category_id: 'eletronicos',
          currency_id: 'BRL',
          description: message,
          quantity: 1,
          unit_price: valorReais 
        }
      ],
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [
            { id: "prepaid_card" },
            { id: "ticket" },
            { id: "atm" }
          ],
        installments: null,
        default_installments: null
      },
      marketplace: 'NONE',
      metadata: {
        user_id: user_id,
        date: new Date(),
        valor_real:valorReais
      },
      operation_type: 'regular_payment',
      total_amount: valorReais,
      site_id: 'MLB',
      user_id: user_id
    };
    const preferenceResponse = await preference.create({ body });
    const redirectUrl = preferenceResponse.init_point;
    console.log(redirectUrl)
    res.json({ redirectUrl });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ error: 'Erro ao processar a requisição' });
  }
}



async function processarWebhookMercadoPago(req, res) {
  try {
    const { data } = req.body;
    const { id } = data;

    // Faz a consulta à API do MercadoPago para obter informações sobre o pagamento
    const url = `https://api.mercadopago.com/v1/payments/${id}?access_token=${process.env.access_token}`;
    const response = await axios.get(url, { timeout: 10000 }); // Adicione um timeout aqui

    if (response.status === 200) {
      const paymentInfo = response.data;
      if(paymentInfo.status === "approved") {
        const dateCriado = paymentInfo.metadata.date.slice(0, 19).replace('T', ' ');
        console.log(paymentInfo.metadata)
        const payment = {
          user_id: paymentInfo.metadata.user_id,
          valor_total: paymentInfo.transaction_amount,
          tipo_pagamento: paymentInfo.payment_type_id,
          email_comprador: paymentInfo.metadata.user_email,
          date_criado: dateCriado,
          valor_real:paymentInfo.metadata.valor_real

        };
        if(paymentInfo.metadata.ligar_auto){
          payment.ligar_auto = paymentInfo.metadata.ligar_auto;
        }
        if(paymentInfo.metadata.machine_id){
          payment.machine_id = paymentInfo.metadata.machine_id;
        }
        // Tente criar o pagamento e atualizar o crédito do usuário de forma assíncrona
        processPaymentAndUpdateUser(payment)
          .then(() => {
            res.status(200).send('Webhook processado com sucesso.');
          })
          .catch((error) => {
            console.error('Erro ao processar pagamento:', error);
            res.status(500).send('Erro ao processar webhook do MercadoPago.');
          });
      } else {
        res.status(400).send('Pagamento não aprovado.');
      }
    } else {
      console.error('Erro ao processar webhook do MercadoPago:', response.statusText);
      res.status(500).send('Erro ao processar webhook do MercadoPago.');
    }
  } catch (error) {
    console.error('Erro ao processar webhook do MercadoPago:', error);
    res.status(500).send('Erro ao processar webhook do MercadoPago.');
  }
}

async function processPaymentAndUpdateUser(payment) {
  // Criar pagamento
  const pagamentoCriado = await PaymentModel.criarPagamento(payment);
  if (pagamentoCriado !== null) {

  }
}
/*
async function testeCriarPreferencia() {
  // monta um req simulado
  const req = {
    body: {
      valorReais: 30,
      user_id: 1,
      apartamento_id: 2,
      cod_reserva:'HM39YAKBSM'
    }
  };

  // monta um res simulado que só imprime no console
  const res = {
    json: (payload) => console.log('[TESTE] redirectUrl =>', payload.redirectUrl),
    status: (code) => ({
      json: (err) => console.error('[TESTE] status', code, err)
    })
  };

  try {
    await criarPreferencia(req, res);
  } catch (err) {
    console.error('[TESTE] erro inesperado', err);
  }
}

*/

module.exports = {
  criarPreferencia,
  processarWebhookMercadoPago
};




