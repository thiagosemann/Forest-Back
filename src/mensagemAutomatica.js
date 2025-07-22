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

async function envioMensagemDiariaTercerizadas() {
  try {
    const hoje = new Date();
    const today = hoje.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const limpezasHoje = await reservasModel.getFaxinasPorPeriodo(today, today);
    // Separar as limpezes por faxina_userId
    const limpezasPorUsuario = {};
    for (const limpeza of limpezasHoje) {
      // Buscar reservas para o apartamento da limpeza
      const reservasHoje = await reservasModel.getReservasPorPeriodoByApartamentoID(limpeza.apartamento_id, today, today);
      // Adiciona a propriedade entramHoje na limpeza
      limpeza.entramHoje = reservasHoje.length > 0 ? true : false;

      if (!limpezasPorUsuario[limpeza.faxina_userId]) {
        limpezasPorUsuario[limpeza.faxina_userId] = [];
      }
      limpezasPorUsuario[limpeza.faxina_userId].push(limpeza);
    }

    for (const userId in limpezasPorUsuario) {
      const user = await usersModel.getUser(userId);
      let diaDaSemana = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
      diaDaSemana = diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1);
      console.log(`Enviando mensagem para o usuário ${user.first_name} (${user.Telefone})`);
      whatsControle.criarMensagemDiariaTerceirizadaLimpeza({
        reservas: limpezasPorUsuario[userId],
        telefone: '5541991017913', // Replace with dynamic phone if possible
        //telefone: user.Telefone,
        diaDaSemana: diaDaSemana,
      });
    }
  } catch (error) {
    console.error('Erro ao buscar reservas de hoje:', error);
  }
}





// envioMensagensInstrucoesEntrada();
// envioCredenciaisHoje();
// ------------------------------------Envio Progamado-----------------------------------------//

// 09:50 - Envia credenciais
cron.schedule('50 9 * * *', async () => {
    await envioMensagemDiariaTercerizadas();
});

// 10:00 - Envia instruções de entrada
cron.schedule('0 10 * * *', async () => {
 await envioMensagensInstrucoesEntrada();
});

// 10:10 - Envia mensagem diária terceirizadas
cron.schedule('10 10 * * *', async () => {
  await envioMensagensInstrucoesEntrada();
});



