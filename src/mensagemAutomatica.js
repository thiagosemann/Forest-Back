const reservasModel = require('./models/Airbnb/reservasAirbnbModel');
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
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const startDate = `${ano}-${mes}-${dia}`;
    const endDate   = startDate;

    // Busca reservas no período de hoje
    const reservasHoje = await reservasModel.getReservasPorPeriodo(startDate, endDate);
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
                            qtdPortarias: 0
                        }
                        whatsControle.envioInstrucoesEntrada(objeto)
          }
    }
  } catch (error) {
    console.error('Erro ao buscar reservas de hoje:', error);
  }
}

async function envioMensagemListaTercerizadas(end_date) {
  try {
    const hoje = new Date();
    const today = hoje.toISOString().split('T')[0];
    // Cache para usuários
    const userCache = {};

    if (end_date === today) {
      // Busca todas as faxinas do dia de uma vez
      const limpezasHoje = await reservasModel.getFaxinasPorPeriodo(today, today);
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
          // telefone: user.Telefone,
          telefone: '5541991017913',

          diaDaSemana: diaDaSemana,
        });
      }
    } else {
      // Busca todas as reservas do período de uma vez
      let dataAtual = new Date(today);
      const dataFinal = new Date(end_date);

      // Busca todas as reservas do período de uma vez só
      const todasReservas = await reservasModel.getReservasPorPeriodo(today, end_date);

      // Indexa reservas por data e apartamento
      const reservasPorDataEApto = {};
      todasReservas.forEach(r => {
        const data = new Date(r.start_date).toISOString().split('T')[0];
        if (!reservasPorDataEApto[data]) reservasPorDataEApto[data] = {};
        reservasPorDataEApto[data][r.apartamento_id] = true;
      });

      while (dataAtual <= dataFinal) {
        const dataStr = dataAtual.toISOString().split('T')[0];
        const limpezasDia = await reservasModel.getFaxinasPorPeriodo(dataStr, dataStr);
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
          whatsControle.criarMensagemListaAtualizadaTerceirizadaLimpeza({
            reservas: limpezasPorUsuario[userId],
            // telefone: user.Telefone,
            telefone: '5541991017913',
            diaDaSemana: diaDaSemana,
            data: dataStr,
            user_name:user.first_name
          });
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    }
  } catch (error) {
    console.error('Erro ao buscar reservas de hoje:', error);
  }
}

async function teste(){
  const hoje = new Date();
  const sevenDaysAfterToday = new Date();
  sevenDaysAfterToday.setDate(hoje.getDate() + 7);
  const sevenDaysAfterTodayString = sevenDaysAfterToday.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  await envioMensagemListaTercerizadas(sevenDaysAfterTodayString);
}




// envioMensagensInstrucoesEntrada();
// envioCredenciaisHoje();
// ------------------------------------Envio Progamado-----------------------------------------//


// 22:00 - Envia lista de 7 dias para frente atualizada
cron.schedule('0 22 * * *', async () => {
  const hoje = new Date();
  const today = hoje.toISOString().split('T')[0]; // Formato YYYY-MM-DD
 // await envioMensagemListaTercerizadas(today);
});

// 09:00 - Envia lista diária de terceirizadas
cron.schedule('0 9 * * *', async () => {
  const hoje = new Date();
  const sevenDaysAfterToday = new Date();
  sevenDaysAfterToday.setDate(hoje.getDate() + 7);
  const sevenDaysAfterTodayString = sevenDaysAfterToday.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  //await envioMensagemListaTercerizadas(sevenDaysAfterTodayString);
});

// 10:00 - Envia instruções de entrada
cron.schedule('0 10 * * *', async () => {
 await envioMensagensInstrucoesEntrada();
});

// 10:10 - Envia mensagem diária terceirizadas
cron.schedule('10 10 * * *', async () => {
  await envioCredenciaisHoje();
});



