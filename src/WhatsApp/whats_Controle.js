const axios = require('axios');
const { W_API_URL_TEXT, W_API_URL_MEDIA, HEADERS, formatarData, formatarCPF, formatarTelefone} = require('./whats_Utilidades');
const mensagens = require('./whats_Mensagens');

async function sendWapiMessage(phone, message) {
  try {
    await axios.post(W_API_URL_TEXT, { phone, message }, { headers: HEADERS });
  } catch (err) {
    console.error('[ERRO] Falha ao enviar texto:', phone, err.response?.data || err.message);
  }
}

async function sendWapiImage(phone, imageBase64, caption) {
  try {
    const image = `data:image/png;base64,${imageBase64}`;
    await axios.post(W_API_URL_MEDIA, { phone, image, caption }, { headers: HEADERS });
  } catch (err) {
    console.error('[ERRO] Falha ao enviar imagem:', phone, err.response?.data || err.message);
  }
}

async function sendWapiMessageAdmin(phone, type, obj) {
  const msg = `[ADMIN] Erro no envio de *${type}*: ${JSON.stringify(obj)}`;
  await sendWapiMessage(phone, msg);
}

async function envioPortaria(obj) {
  const base = {
    ...obj,
    cpfFormatado: formatarCPF(obj.cpf),
    telefoneFormatado: formatarTelefone(obj.telefone_hospede),
    checkin: formatarData(obj.dataEntrada),
    checkout: formatarData(obj.dataSaida),
  };
  const text = mensagens.criarMensagemPortaria(base);
  try {
    if (obj.imagemBase64) {
      if (obj.telefone_principal) await sendWapiImage(obj.telefone_principal, obj.imagemBase64, text);
      if (obj.telefone_secundario) await sendWapiImage(obj.telefone_secundario, obj.imagemBase64, text);
    } else {
      await sendWapiMessage(obj.telefone_principal || obj.telefone_secundario, text);
    }
  } catch (err) {
    console.error(err);
    await sendWapiMessageAdmin('41991017913', 'envioPortaria', obj);
  }
}

async function envioForest(obj) {
  const base = {
    ...obj,
    cpfFormatado: formatarCPF(obj.cpf),
    telefoneFormatado: formatarTelefone(obj.telefone_hospede),
    checkin: formatarData(obj.dataEntrada),
    checkout: formatarData(obj.dataSaida),
  };
  const text = mensagens.criarMensagemForest(base);
  try {
    await sendWapiImage('41999283936', obj.imagemBase64, text);
  } catch (err) {
    console.error(err);
    await sendWapiMessageAdmin('41991017913', 'envioForest', obj);
  }
}

async function envioCadastroConcluido(obj) {
  const text = mensagens.criarMensagemCadastroConcluido(obj);
  try {
    await sendWapiMessage('41991017913', text);
    await sendWapiMessage(obj.telefone_hospede, text);
  } catch (err) {
    await sendWapiMessageAdmin('41991017913', 'envioCadastroConcluido', obj);
  }
}

async function envioInstrucoesEntrada(obj) {
  const base = {
    ...obj,
    cpfFormatado: formatarCPF(obj.cpf),
    telefoneFormatado: formatarTelefone(obj.telefone_hospede),
    checkin: formatarData(obj.dataEntrada),
    checkout: formatarData(obj.dataSaida),
  };
  const text = mensagens.criarMensagemInstrucoesEntrada({ ...base, qtdPortarias: obj.qtdPortarias });
  try {
    await sendWapiMessage('41991017913', text);
    await sendWapiMessage('41999283936', text);
  } catch (err) {
    await sendWapiMessageAdmin('41991017913', 'envioInstrucoesEntrada', obj);
  }
}

async function envioMensagemBoasVindas(obj) {
  const base = { ...obj, checkin: formatarData(obj.dataEntrada) };
  const text = mensagens.criarMensagemBoasVindas(base);
  try {
    await sendWapiMessage('41991017913', text);
    await sendWapiMessage('41999283936', text);
  } catch (err) {
    await sendWapiMessageAdmin('41991017913', 'envioMensagemBoasVindas', obj);
  }
}

async function envioMensagemLimpezaExtra(obj) {
  const text = mensagens.criarMensagemLimpezaExtra(obj);
  try {
    await sendWapiMessage(obj.telefone_hospede, text);
  } catch (err) {
    await sendWapiMessageAdmin('41991017913', 'envioMensagemLimpezaExtra', obj);
  }
}

async function envioMensagemInstrucoesSaida(obj) {
  const text = mensagens.criarMensagemInstrucoesSaida(obj);
  try {
    await sendWapiMessage(obj.telefone_hospede, text);
  } catch (err) {
    await sendWapiMessageAdmin('41991017913', 'envioMensagemInstrucoesSaida', obj);
  }
}

async function envioPagamentoEarly({ telefone_hospede, nome, apartamento, cod_reserva, valor, linkPagamento }) {
  console.log(telefone_hospede)
  const text = mensagens.criarMensagemPagamentoEarly({
    nome,
    apartamento,
    cod_reserva,
    valor,
    linkPagamento
  });
  try {
    await axios.post(W_API_URL_TEXT, { phone: telefone_hospede, message: text }, { headers: HEADERS });
  } catch (err) {
    console.error('[ERRO] envioPagamentoEarly:', '41991017913', err.response?.data || err.message);
  }
}


module.exports = {
  sendWapiMessage,
  sendWapiImage,
  sendWapiMessageAdmin,
  envioPortaria,
  envioForest,
  envioCadastroConcluido,
  envioInstrucoesEntrada,
  envioMensagemBoasVindas,
  envioMensagemLimpezaExtra,
  envioMensagemInstrucoesSaida,
  envioPagamentoEarly
};