const reservasModel = require('./models/Airbnb/reservasAirbnbModel');
const apartamentoModel = require('./models/Airbnb/apartamentosAirbnbModel');
const predioPortariaModel = require('./models/Airbnb/prediosPortariasModel')
const whatsApi = require('./whats-api')
const checkinModel  = require('./models/Airbnb/checkinFormModel')
const cron = require('node-cron');

async function envioCredenciaisHoje() {
  try {
    const reservasHoje = await reservasModel.getReservasHoje();

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
                return whatsApi.envioPortaria(mensagem);
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
    const reservasHoje = await reservasModel.getReservasHoje();
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
                        whatsApi.envioInstrucoesEntrada(objeto)
          }
    }
  } catch (error) {
    console.error('Erro ao buscar reservas de hoje:', error);
  }
}

 //envioMensagensInstrucoesEntrada();
 //envioCredenciaisHoje();
// ------------------------------------Envio Progamado-----------------------------------------//
/*
cron.schedule('0 10 * * *', async () => {
  await envioCredenciaisHoje();
});
*/


