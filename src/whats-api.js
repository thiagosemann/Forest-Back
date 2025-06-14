const axios = require('axios');

// Configuração da W-API (utilizando as variáveis do arquivo .env)
const { W_API_BASE_URL, W_API_INSTANCE_ID, W_API_TOKEN } = process.env;

const W_API_URL_TEXT = `${W_API_BASE_URL}/v1/message/send-text?instanceId=${W_API_INSTANCE_ID}`;
const W_API_URL_MEDIA = `${W_API_BASE_URL}/v1/message/send-image?instanceId=${W_API_INSTANCE_ID}`;

const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${W_API_TOKEN}`,
};

// ------------------------GENÉRICOS----------------------------------------------//

// Envia mensagem de texto
async function sendWapiMessage(phoneNumber, message) {
  try {
    await axios.post(
      W_API_URL_TEXT,
      { phone: phoneNumber, message },
      { headers: HEADERS }
    );
  } catch (error) {
    console.error('[ERRO] Falha ao enviar mensagem para usuário:', {
      phoneNumber,
      error: error.response?.data || error.message,
    });
  }
}

// Envia imagem (URL pública ou base64) com legenda opcional
async function sendWapiImage(phoneNumber, imageBase64,message) {
  try {
    let image = "data:image/png;base64,"+imageBase64
    await axios.post(
      W_API_URL_MEDIA,
      { phone: phoneNumber, image: image,caption:message },
      { headers: HEADERS }
    );
  } catch (error) {
    console.error('[ERRO] Falha ao enviar imagem para usuário:', {
      phoneNumber,
      error: error.response?.data || error.message,
    });
  }
}

// Notifica o administrador em caso de erro
async function sendWapiMessageAdmin(phoneNumber, objeto) {
  try {
    const message = `[ADMIN] Falha ao enviar mensagem do tipo *${type}* para o usuário: ${JSON.stringify(objeto)}`;
    await sendWapiMessage(phoneNumber, message);
  } catch (error) {
    console.error('[ERRO CRÍTICO] Falha ao notificar administrador:', {
      type,
      error: error.response?.data || error.message,
    });
  }
}

async function envioPortaria(objeto) {
    try {
        const nome = objeto.name;
        const cpf = formatarCPF(objeto.cpf);
        const telefone = formatarTelefone(objeto.telefone_hospede);
        const checkin = formatarData(objeto.dataEntrada);
        const checkout = formatarData(objeto.dataSaida);
        const apartamento = objeto.apartamento_name
        let message = `*Apartamento:* ${apartamento}\n*Nome:* ${nome}\n*CPF:* ${cpf}\n*Telefone:* ${telefone}\n*Entrada:* ${checkin}\n*Saída:* ${checkout}`;
        if(objeto.imagemBase64){
            if(objeto.telefone_principal){
                await sendWapiImage(objeto.telefone_principal, objeto.imagemBase64,message); // 
            }
            if(objeto.telefone_secundario){
                await sendWapiImage(objeto.telefone_secundario, objeto.imagemBase64,message); // 
            }
        }else{
            await sendWapiMessage("41991017913", message); // 
        }
        
    } catch (error) {
      console.error(error)
       // await sendWapiMessageAdmin("41991017913", objeto);
    }
}

async function envioForest(objeto) {
    try {
        const nome = objeto.name;
        const cpf = formatarCPF(objeto.cpf);
        const telefone = formatarTelefone(objeto.telefone_hospede);
        const checkin = formatarData(objeto.dataEntrada);
        const checkout = formatarData(objeto.dataSaida);
        const apartamento = objeto.apartamento_name
        let message = `*Apartamento:* ${apartamento}\n*Nome:* ${nome}\n*CPF:* ${cpf}\n*Telefone:* ${telefone}\n*Entrada:* ${checkin}\n*Saída:* ${checkout}`;
        await sendWapiImage("41999283936", objeto.imagemBase64,message); //         
    } catch (error) {
      console.error(error)
    }
}

async function envioCadastroConcluido(objeto) {
    try {
        let message = `Seu cadastro no sistema da *Forest* foi concluído com sucesso para a reserva: *(${objeto.cod_reserva})*`
        //await sendWapiMessage(objeto.telefone_hospede, message); // 
         await sendWapiMessage("41991017913", message); // 
         await sendWapiMessage(objeto.telefone_hospede, message); // 
         
    } catch (error) {
        await sendWapiMessageAdmin("41991017913", objeto);
    }
}

async function envioInstrucoesEntrada(objeto) {
    try {
        let message='';
        if(objeto.qtdPortarias>0){
            message = `Olá *${objeto.nome}*,\n\nO seu check in é a partir das *${objeto.horario_check_in}*.\nO check out deve ser realizado *${objeto.horario_check_out}*.\n*Endereço:*\nO Apartamento fica na *${objeto.apartamento_logradouro}, ${objeto.apartamento_bairro}*. Encaminhamos sua documentação à portaria. Chegando lá se apresente como hóspede do apartamento *${objeto.apartamento_numero}*.\n*Entrada:*\nO Ap fica no *${objeto.andar_apartamento} ANDAR* , ao chegar na porta você encontrará uma fechadura eletronica, insira a *SENHA DA PORTA ${objeto.senha_porta}* tecla de confirmação ou *.\n*WIFI:*\nRede Internet: *${objeto.apartamento_wifi}*\nSenha:  *${objeto.apartamento_wifi_senha}*\nEm caso de dúvidas estamos a disposição!`
        }else{
            message = `Olá *${objeto.nome}*,\n\nO seu check in é a partir das *${objeto.horario_check_in}*.\nO check out deve ser realizado *${objeto.horario_check_out}*.\n*Endereço:*\nO Apartamento fica na *${objeto.apartamento_logradouro}, ${objeto.apartamento_bairro}*. Sua facial foi cadastrada no sistema, caso ela não funcione por favor entre em contato.\n*Entrada:*\nO Ap fica no *${objeto.andar_apartamento} ANDAR* , ao chegar na porta você encontrará uma fechadura eletronica, insira a *SENHA DA PORTA ${objeto.senha_porta}* tecla de confirmação ou *.\n*WIFI:*\nRede Internet: *${objeto.apartamento_wifi}*\nSenha:  *${objeto.apartamento_wifi_senha}*\nEm caso de dúvidas estamos a disposição!`

        }
        //await sendWapiMessage(objeto.telefone_hospede, message); // 
        await sendWapiMessage("41991017913", message); // 
        await sendWapiMessage("41999283936", message); // 
        
    } catch (error) {
        await sendWapiMessageAdmin("41991017913", objeto);
    }
}

async function envioMensagemBoasVindas(objeto) {
    try {
        let message=`Olá ${objeto.nome},
            Obrigado por escolher nosso espaço para se hospedar!
            Esperamos que você desfrute da sua estadia conosco e se sinta em casa.
            No dia ${checkin} enviaremos aqui, todas as instruções para o ingresso no apartamento. 
            O horário de entrada é as ${objeto.horario_check_in}.
            Disponibilizamos jogo de cama, banho, travesseiros e cobertores. 
            Pedimos que façam bom uso dos mesmos. Manchas de maquiagem, sangue, café e afins, serão cobradas ao final da estadia.
            Se precisar de qualquer coisa antes, durante e depois de sua estadia, não hesite em nos contactar.
            Em caso de dúvidas, pode responder nesse mesmo contato.
            Atenciosamente,
            Equipe Forest e Ana Cristina`
    
        //await sendWapiMessage(objeto.telefone_hospede, message); // 
        await sendWapiMessage("41991017913", message); // 
        await sendWapiMessage("41999283936", message); // 
        
    } catch (error) {
        await sendWapiMessageAdmin("41991017913", objeto);
    }
}






// ------------------------MENSAGENS PERSONALIZADAS----------------------------------------------//

function criarMensagemBoasVindas(objeto){
  const checkin = formatarData(objeto.dataEntrada);
    return `Olá ${objeto.nome},
            Obrigado por escolher nosso espaço para se hospedar!
            Esperamos que você desfrute da sua estadia conosco e se sinta em casa.
            No dia ${checkin} enviaremos aqui, todas as instruções para o ingresso no apartamento. 
            O horário de entrada é as ${objeto.horario_check_in}.
            Disponibilizamos jogo de cama, banho, travesseiros e cobertores. 
            Pedimos que façam bom uso dos mesmos. Manchas de maquiagem, sangue, café e afins, serão cobradas ao final da estadia.
            Se precisar de qualquer coisa antes, durante e depois de sua estadia, não hesite em nos contactar.
            Em caso de dúvidas, pode responder nesse mesmo contato.
            Atenciosamente,
            Equipe Forest e Ana Cristina`
}


function criarMensageLimpezaExtra(objeto){
    return `Bom dia ${objeto.nome},
            Esperamos que esteja aproveitando sua estadia conosco!!
            Gostaríamos de verificar se está tudo certo com nossos serviços e acomodações.
            Estamos sempre buscando maneiras de melhorar a experiência dos nossos hóspedes.
            Com isso em mente, gostaríamos de oferecer um serviço adicional de limpeza de quarto, troca dos lençóis e toalhas.
            Por um custo adicional de ${objeto.apartamento_limpeza}.
            Essa opção permitirá que você tenha lençóis e toalhas frescos, bem como um ambiente limpo e arrumado durante toda a sua estadia.
            Nossa equipe de limpeza estará pronta para atendê-lo(a) conforme sua conveniência, respeitando sua privacidade e preferências de horário.
            Mais uma vez, agradecemos por escolher nossa acomodação. Esperamos que sua estadia seja agradável em todos os aspectos.
            Se houver qualquer outra solicitação ou necessidade especial, não hesite em nos informar. Estamos aqui para ajudar a tornar sua estadia o mais confortável possível.

            Atenciosamente,
            Equipe Forest`
}

function criarMensagemInstrucoesSaida(objeto){
    return `Boa Noite ${objeto.nome},
            Amanhã as ${objeto.horario_check_out} chega ao fim sua estadia.
            Gostariamos de agradecer pela sua escolha, e lhe dizer que estaremos sempre de portas abertas para te receber novamente!
            Pedimos a gentileza de nos avisar assim que desocupar o apartamento, assim poderemos nos organizar com a entrada da equipe de limpeza e vistoria.
            Sinta-se a vontade para nos passar sugestões e feedbacks sobre a sua estada.
            Até breve !
            Equipe Forest. `
}



// ------------------------EXPORTAÇÃO----------------------------------------------//
function formatarData(data) {
  const dataObj = new Date(data);
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
  const ano = dataObj.getFullYear();
  return `${dia}/${mes}/${ano}`;
}
function formatarCPF(cpf) {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}
function formatarTelefone(telefone) {
  return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}
module.exports = {
  envioPortaria,
  envioCadastroConcluido,
  envioInstrucoesEntrada,
  envioForest,
  envioCadastroConcluido
};
