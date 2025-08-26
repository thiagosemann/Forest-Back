const axios = require('axios');
const { W_API_URL_TEXT, W_API_URL_MEDIA, HEADERS, formatarData, formatarCPF, formatarTelefone} = require('./whats_Utilidades');
const mensagens = require('./whats_Mensagens');
const e = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const W_API_INSTANCE_ID = process.env.W_API_INSTANCE_ID;

async function getAllGroups() {
  try {
    const response = await axios.get(`https://api.w-api.app/v1/group/get-all-groups?instanceId=${W_API_INSTANCE_ID}`, {
      headers: HEADERS,
    });
    console.log('[INFO] Grupos obtidos com sucesso:', response.data);
    
    return grupos;
  } catch (err) {
    console.error('[ERRO] Falha ao buscar grupos:', err.response?.data || err.message);
    return [];
  }
}
//getAllGroups()

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
    await sendWapiMessageAdmin('5541991017913', 'envioPortaria', obj);
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
    await sendWapiImage('5541999283936', obj.imagemBase64, text);
  } catch (err) {
    console.error(err);
    await sendWapiMessageAdmin('5541991017913', 'envioForest', obj);
  }
}

async function envioCadastroConcluido(obj) {
  const text = mensagens.criarMensagemCadastroConcluido(obj);
  try {
    await sendWapiMessage('5541991017913', text);
    await sendWapiMessage(obj.telefone_hospede, text);
  } catch (err) {
    await sendWapiMessageAdmin('5541991017913', 'envioCadastroConcluido', obj);
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
    await sendWapiMessage('5541991017913', text);
    await sendWapiMessage('5541999283936', text);
  } catch (err) {
    await sendWapiMessageAdmin('5541991017913', 'envioInstrucoesEntrada', obj);
  }
}

async function envioMensagemBoasVindas(obj) {
  const base = { ...obj, checkin: formatarData(obj.dataEntrada) };
  const text = mensagens.criarMensagemBoasVindas(base);
  try {
    await sendWapiMessage('5541991017913', text);
    await sendWapiMessage('5541999283936', text);
  } catch (err) {
    await sendWapiMessageAdmin('5541991017913', 'envioMensagemBoasVindas', obj);
  }
}

async function envioMensagemLimpezaExtra(obj) {
  const text = mensagens.criarMensagemLimpezaExtra(obj);
  try {
    await sendWapiMessage(obj.telefone_hospede, text);
  } catch (err) {
    await sendWapiMessageAdmin('5541991017913', 'envioMensagemLimpezaExtra', obj);
  }
}

async function envioMensagemInstrucoesSaida(obj) {
  const text = mensagens.criarMensagemInstrucoesSaida(obj);
  try {
    await sendWapiMessage(obj.telefone_hospede, text);
  } catch (err) {
    await sendWapiMessageAdmin('5541991017913', 'envioMensagemInstrucoesSaida', obj);
  }
}

async function envioPagamentoEarly({ telefone_hospede, nome, apartamento, cod_reserva, valor, linkPagamento }) {
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
    console.error('[ERRO] envioPagamentoEarly:', '5541991017913', err.response?.data || err.message);
  }
}

async function envioEarlyPago(obj) {
  const text = mensagens.criarMensagemEarlyPago(obj);
  try {
    await sendWapiMessage('5541991017913', text);
    await sendWapiMessage('5541999283936', text);
  } catch (err) {
    await sendWapiMessageAdmin('5541991017913', 'envioCadastroConcluido', obj);
  }
}

async function criarMensagemSelecionadaComoTerceirizadaLimpeza(obj) {
  obj.checkin = formatarData(obj.checkin);
  const text = mensagens.criarMensagemSelecionadaComoTerceirizadaLimpeza(obj);
 
  try {
    await sendWapiMessage(obj.telefone, text);
  } catch (err) {
    await sendWapiMessageAdmin('5541991017913', 'envioMensagemLimpezaExtra', obj);
  }
}

async function criarMensagemDiariaTerceirizadaLimpeza(obj) {
  const text = mensagens.criarMensagemDiariaTerceirizadaLimpeza(obj);

  try {
    if(obj.grupo_whats){
       await sendWapiMessage(obj.grupo_whats, text);
    }else{
      await sendWapiMessage(obj.telefone, text);
    }
   
  } catch (err) {
    await sendWapiMessageAdmin('5541991017913', 'envioMensagemLimpezaExtra', obj);
  }
}

async function criarMensagemListaAtualizadaTerceirizadaLimpeza(obj) {
  try {
    for (const userId in obj.mensagensParaEnviar) {
      obj.mensagensParaEnviar[userId].menssagem = mensagens.criarMensagemListaAtualizadaTerceirizadaLimpeza(obj.mensagensParaEnviar[userId]);
       if(obj.mensagensParaEnviar[userId].grupo_whats){
          await sendWapiMessage(obj.mensagensParaEnviar[userId].grupo_whats, obj.mensagensParaEnviar[userId].menssagem);
        }else{
          await sendWapiMessage(obj.mensagensParaEnviar[userId].telefone, obj.mensagensParaEnviar[userId].menssagem);
        }
   }
  } catch (err) {
    console.log(err);
    await sendWapiMessageAdmin('5541991017913', 'envioMensagemLimpezaExtra', obj);
  }
}

async function criarMensagemTercerizadaLimpezaReservaAtribuidaNoDia(obj) {
  try {
    const text =`O apartamento ${obj.apartamento_name} foi reservado para hoje. Caso ainda não tenha sido limpo, por favor, verifique a necessidade de reorganizar as limpezas do dia.`
     await sendWapiMessage(obj.telefone, obj.mensagensParaEnviar[userId].menssagem);

  } catch (err) {
    await sendWapiMessageAdmin('5541991017913', 'envioMensagemLimpezaExtra', obj);
  }
}


async function criarMensagemCadastroViaLink(obj) {
  try {
    let text = `Forest:\nObrigado por escolher nossa acomodação!\nPara acessar o condomínio, é necessário que todos os hóspedes realizem o cadastro no link abaixo.\nEssas informações serão utilizadas exclusivamente para controle de acesso ao condomínio.\n`;
    text+= `${obj.tipoSite}:\n`;
    text+=`Início:  ${formatarData(obj.dataEntrada)}\n`;
    text+=`Término:  ${formatarData(obj.dataSaida)}\n`;
    text += `${obj.linkCadastro}\n`;

    await sendWapiMessage(obj.telefone, text);
  } catch (err) {
    await sendWapiMessageAdmin('5541991017913', 'envioMensagemLimpezaExtra', obj);
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
  envioPagamentoEarly,
  envioEarlyPago,
  criarMensagemSelecionadaComoTerceirizadaLimpeza,
  criarMensagemDiariaTerceirizadaLimpeza,
  criarMensagemListaAtualizadaTerceirizadaLimpeza,
  criarMensagemTercerizadaLimpezaReservaAtribuidaNoDia,
  criarMensagemCadastroViaLink
};