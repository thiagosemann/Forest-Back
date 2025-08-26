const reservasModel = require('./models/Airbnb/reservasAirbnbModel');
const limpezasExtasModel = require('./models/Airbnb/limpezaExtraAirbnbModel');
const apartamentoModel = require('./models/Airbnb/apartamentosAirbnbModel');
const usersModel = require('./models/Airbnb/usersAirbnbModel');
const predioPortariaModel = require('./models/Airbnb/prediosPortariasModel')
const whatsControle = require('./WhatsApp/whats_Controle')
const checkinModel  = require('./models/Airbnb/checkinFormModel')
const cron = require('node-cron');

async function envioCredenciaisHoje() {
  try {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');
    const startDate= `${ano}-${mes}-${dia}`;

    const reservasHoje = await reservasModel.getReservasPorPeriodo(startDate,startDate);
    // Filtra apenas reservas ativas
    const reservasAtivas = reservasHoje.filter(r => r.description !== 'CANCELADA');

    await Promise.all(reservasAtivas.map(async reserva => {
      // Pega apartamento e check-ins em paralelo
      const [apartamento, users] = await Promise.all([
        apartamentoModel.getApartamentoById(reserva.apartamento_id),
        checkinModel.getCheckinsByReservaId(reserva.id),
      ]);

      const portarias = await predioPortariaModel.getPortariasByPredio(apartamento.predio_id);

      // Dados comuns a todas as mensagens
      const commonData = {
        dataEntrada: reserva.start_date,
        dataSaida:   reserva.end_data,  // ou reserva.end_date, conforme o nome correto
        apartamento_name: apartamento.nome,
      };

      // Para cada portaria que envia via WhatsApp, dispara todas as mensagens em paralelo
      await Promise.all(
        portarias
          .filter(p => p.modo_envio === 'whats')
          .map(portaria => {
            // define se só texto ou texto + foto
            const apenasTexto = (portaria.envio_documentos_texto === 1
                                && portaria.envio_documentos_foto === 0);

            return Promise.all(
              users.map(user => {
                // campos básicos que sempre aparecem
                const baseObj = {
                  name:            user.first_name,
                  cpf:             user.CPF,
                  telefone_hospede:        user.Telefone,
                  ...commonData,
                };

                // adiciona campos extras se for foto
                const mensagem = apenasTexto
                  ? baseObj
                  : {
                      ...baseObj,
                      telefone_principal: portaria.telefone_principal,
                      telefone_secundario: portaria.telefone_secundario,
                      imagemBase64:        user.imagemBase64,
                    };
                return whatsControle.envioPortaria(mensagem);
              })
            );
          })
      );
    }));
  } catch (error) {
    console.error('Erro ao enviar credenciais hoje:', error);
  }
}


async function envioMensagensInstrucoesEntrada() {
  try {
    const hoje = new Date();
    const today = hoje.toISOString().split('T')[0];
    // Busca reservas no período de hoje
    const reservasHoje = await reservasModel.getReservasPorPeriodo(today, today);
    for (const reserva of reservasHoje) {
        if(reserva.description == "CANCELADA"){
            return
        }
        const apartamento = await apartamentoModel.getApartamentoById(reserva.apartamento_id)
        const portarias  = await predioPortariaModel.getPortariasByPredio(apartamento.predio_id)
        const users = await checkinModel.getCheckinsByReservaId(reserva.id)
          for (const user of users){
                let objeto={
                            nome:user.first_name,
                            horario_check_in:reserva.check_in,
                            horario_check_out:reserva.check_out,
                            apartamento_logradouro:apartamento.endereco,
                            apartamento_bairro:apartamento.bairro,
                            apartamento_numero:"",
                            andar_apartamento:apartamento.andar,
                            senha_porta:apartamento.senha_porta,
                            apartamento_wifi:apartamento.ssid_wifi,
                            apartamento_wifi_senha:apartamento.senha_wifi,
                            qtdPortarias: portarias.length
                        }
                        whatsControle.envioInstrucoesEntrada(objeto)
          }
    }
  } catch (error) {
    console.error('Erro ao buscar reservas de hoje:', error);
  }
}

async function envioMensagemTercerizadasHoje() {
  try {
    const hoje = new Date();
    const today = hoje.toISOString().split('T')[0];
    // Cache para usuários
    const userCache = {};
      // Busca todas as faxinas do dia de uma vez
      const limpezasNormais = await reservasModel.getFaxinasPorPeriodo(today, today);
      const limpezasExtas = await limpezasExtasModel.getLimpezasExtrasPorPeriodo(today, today); 
      const limpezasHoje = [...limpezasNormais, ...limpezasExtas];
      // Busca todas as reservas do dia de uma vez
      const reservasHoje = await reservasModel.getReservasPorPeriodo(today, today);
      const reservasPorApartamento = {};
      reservasHoje.forEach(r => {
        reservasPorApartamento[r.apartamento_id] = true;
      });
      const limpezasPorUsuario = {};
      for (const limpeza of limpezasHoje) {
        if (!limpeza.faxina_userId) continue; // <-- PULA faxinas sem user
        limpeza.entramHoje = !!reservasPorApartamento[limpeza.apartamento_id];
        if (!limpezasPorUsuario[limpeza.faxina_userId]) {
          limpezasPorUsuario[limpeza.faxina_userId] = [];
        }
        limpezasPorUsuario[limpeza.faxina_userId].push(limpeza);
      }
      for (const userId in limpezasPorUsuario) {
        if (!userId || userId === 'null' || userId === 'undefined') continue; // <-- PULA userId inválido
        let user = userCache[userId];
        if (!user) {
          user = await usersModel.getUser(userId);
          userCache[userId] = user;
        }
        let diaDaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });
        diaDaSemana = diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1);
        whatsControle.criarMensagemDiariaTerceirizadaLimpeza({
          reservas: limpezasPorUsuario[userId],
           telefone: user.Telefone,
           grupo_whats: user.grupo_whats,
          //telefone: '5541991017913',
          diaDaSemana: diaDaSemana,
        });
      }

  } catch (error) {
    console.error('Erro ao buscar reservas de hoje:', error);
  }
}

async function envioMensagemListaTercerizadas() {
  try {
      const hoje = new Date();
      const oneDayAfterToday = new Date();
      oneDayAfterToday.setDate(hoje.getDate());
      const tomorrow = oneDayAfterToday.toISOString().split('T')[0]; // Formato YYYY-MM-DD


      const sevenDaysAfterToday = new Date();
      sevenDaysAfterToday.setDate(hoje.getDate() + 9);
      const dataFinal = sevenDaysAfterToday.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      // Cache para usuários
      const userCache = {};
      // Busca todas as reservas do período de uma vez
      let dataAtual = new Date(tomorrow);
      // Busca todas as reservas do período de uma vez só
      const todasReservas = await reservasModel.getReservasPorPeriodo(tomorrow, dataFinal);

      // Indexa reservas por data e apartamento
      const reservasPorDataEApto = {};
      todasReservas.forEach(r => {
        const data = new Date(r.start_date).toISOString().split('T')[0];
        if (!reservasPorDataEApto[data]) reservasPorDataEApto[data] = {};
        reservasPorDataEApto[data][r.apartamento_id] = true;
      });
      let mensagensParaEnviar = {};
      while (dataAtual <= sevenDaysAfterToday) {
        const dataStr = dataAtual.toISOString().split('T')[0];
        const limpezasNormais = await reservasModel.getFaxinasPorPeriodo(dataStr, dataStr);
        const limpezasExtas = await limpezasExtasModel.getLimpezasExtrasPorPeriodo(dataStr, dataStr); 
        const limpezasDia = [...limpezasNormais, ...limpezasExtas];

        const limpezasPorUsuario = {};
        for (const limpeza of limpezasDia) {
          if (!limpeza.faxina_userId) continue; // <-- PULA faxinas sem user
          limpeza.entramHoje = !!(reservasPorDataEApto[dataStr] && reservasPorDataEApto[dataStr][limpeza.apartamento_id]);
          if (!limpezasPorUsuario[limpeza.faxina_userId]) {
            limpezasPorUsuario[limpeza.faxina_userId] = [];
          }
          limpezasPorUsuario[limpeza.faxina_userId].push(limpeza);
        }


        for (const userId in limpezasPorUsuario) {
          if (!userId || userId === 'null' || userId === 'undefined') continue; // <-- PULA userId inválido
          let user = userCache[userId];
          if (!user) {
            user = await usersModel.getUser(userId);
            userCache[userId] = user;
          }

          let diaDaSemana = dataAtual.toLocaleDateString('pt-BR', { weekday: 'long' });
          diaDaSemana = diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1);
          if(mensagensParaEnviar[userId] === undefined){
            mensagensParaEnviar[userId] = {
              user_name: user.first_name,
              telefone: user.Telefone,     
              grupo_whats: user.grupo_whats,
         
              reservas: []
            };
          }
          mensagensParaEnviar[userId].reservas.push(limpezasPorUsuario[userId])
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
      whatsControle.criarMensagemListaAtualizadaTerceirizadaLimpeza({
        mensagensParaEnviar: mensagensParaEnviar,
      });
  } catch (error) {
    console.error('Erro ao buscar reservas de hoje:', error);
  }
}


//envioMensagemListaTercerizadas();
//envioMensagemTercerizadasHoje()
//envioMensagensInstrucoesEntrada();
//envioCredenciaisHoje();
// ------------------------------------Envio Progamado-----------------------------------------//

// 22:00 - Envia lista de 7 dias para frente atualizada
cron.schedule('5 22 * * *', async () => {
  await envioMensagemListaTercerizadas();
});

// 09:00 - Envia lista diária de terceirizadas
cron.schedule('0 9 * * *', async () => {
  await envioMensagemTercerizadasHoje()
});

// 10:00 - Envia instruções de entrada
cron.schedule('0 10 * * *', async () => {
 await envioMensagensInstrucoesEntrada();
});

// 10:10 - Envia mensagem diária terceirizadas
cron.schedule('10 10 * * *', async () => {
  await envioCredenciaisHoje();
});


