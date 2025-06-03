const reservasModel = require('./models/Airbnb/reservasAirbnbModel');
const apartamentoModel = require('./models/Airbnb/apartamentosAirbnbModel');
const predioPortariaModel = require('./models/Airbnb/prediosPortariasModel')
const whatsApi = require('./whats-api')
const checkinModel  = require('./models/Airbnb/checkinFormModel')
const cron = require('node-cron');

async function envioCredenciaisHoje() {
  try {
    const reservasHoje = await reservasModel.getReservasHoje();
    for (const reserva of reservasHoje) {
        if(reserva.description == "CANCELADA"){
            return
        }
        const apartamento = await apartamentoModel.getApartamentoById(reserva.apartamento_id)
        const portarias  = await predioPortariaModel.getPortariasByPredio(apartamento.predio_id)
        for (const portaria of portarias){
            if(portaria.modo_envio == "whats"){
                if(portaria.envio_documentos_texto == 1 && portaria.envio_documentos_foto == 0){
                        const users = await checkinModel.getCheckinsByReservaId(reserva.id)
                        for (const user of users){
                            let objeto={
                                name: user.first_name,
                                cpf: user.CPF,
                                dataEntrada: reserva.start_date,
                                dataSaida: reserva.end_data,
                                telefone: user.Telefone,
                                apartamento_name: apartamento.nome
                                }
                                whatsApi.envioPortaria(objeto);
                        }
                }else{
                        const users = await checkinModel.getCheckinsByReservaId(reserva.id)
                        for (const user of users){
                            let objeto={
                                name: user.first_name,
                                cpf: user.CPF,
                                dataEntrada: reserva.start_date,
                                dataSaida: reserva.end_data,
                                telefone_hospede:user.Telefone,
                                telefone_principal: portaria.telefone_principal,
                                telefone_secundario: portaria.telefone_secundario,
                                imagemBase64: user.imagemBase64,
                                apartamento_name: apartamento.nome
                                }
                                whatsApi.envioPortaria(objeto);
                        }
                }
            }
        }
      // lógica de negócio
    }
  } catch (error) {
    console.error('Erro ao buscar reservas de hoje:', error);
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
  console.log('Executando envioCredenciaisHoje às 10:00...');
  await envioCredenciaisHoje();
});
*/


