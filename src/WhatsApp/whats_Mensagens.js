
function criarMensagemPortaria(obj) {
  const nome = obj.name;
  const cpf = obj.cpfFormatado;
  const telefone = obj.telefoneFormatado;
  const checkin = obj.checkin;
  const checkout = obj.checkout;
  const apt = obj.apartamento_name;
  return `*Apartamento:* ${apt}\n*Nome:* ${nome}\n*CPF:* ${cpf}\n*Telefone:* ${telefone}\n*Entrada:* ${checkin}\n*Saída:* ${checkout}`;
}

function criarMensagemForest(obj) {
  // mesma estrutura de portaria, mas sempre com imagem
  return criarMensagemPortaria(obj);
}

function criarMensagemCadastroConcluido(obj) {
  return `Seu cadastro no sistema da *Forest* foi concluído com sucesso para a reserva: *(${obj.cod_reserva})*`;
}

function criarMensagemEarlyPago(obj) {
  return `Pagaemento Early para o Apartamento  *(${obj.apartamento_name})* confimada.`;
}
function criarMensagemInstrucoesEntrada(obj) {
  const base = criarMensagemPortaria(obj);
  let instrucoes;
  if (obj.qtdPortarias > 0) {
    instrucoes = `Chegando lá, apresente-se como hóspede do apto ${obj.apartamento_numero}.`;
  } else {
    instrucoes = `Sua facial foi cadastrada no sistema; caso não funcione, entre em contato.`;
  }
  return `${base}\n*Entrada:* ${obj.andar_apartamento}º andar, senha: ${obj.senha_porta}.\n${instrucoes}\n*WiFi:* ${obj.apartamento_wifi} / ${obj.apartamento_wifi_senha}`;
}

function criarMensagemBoasVindas(obj) {
  const checkin = obj.checkin;
  return `Olá ${obj.nome},\nObrigado por escolher nosso espaço! No dia ${checkin} enviaremos instruções de ingresso. Horário de entrada: ${obj.horario_check_in}. \nDisponibilizamos roupa de cama e banho. Bons usos!`;
}

function criarMensagemLimpezaExtra(obj) {
  return `Bom dia ${obj.nome}, oferecemos limpeza extra por R$${obj.apartamento_limpeza}. Deseja agendar?`;
}

function criarMensagemInstrucoesSaida(obj) {
  return `Boa noite ${obj.nome}, amanhã às ${obj.horario_check_out} finaliza sua estadia. Avise ao desocupar para limpeza e vistoria. Até breve!`;
}

function criarMensagemPagamentoEarly({ nome, apartamento, cod_reserva, valor, linkPagamento }) {
  // garante que comece com https://
  const url = linkPagamento.startsWith('http')
    ? linkPagamento
    : `https://${linkPagamento}`;

  return [
    `*TAXA OPCIONAL*`,
    ``,
    `🔔 *Você gostaria de entrar antes no apartamento?* 🔔`,
    ``,
    `Olá ${nome}`,
    `Este apartamento já está limpo e pronto para recebe-los.`,
    `Se deseja antecipar sua entrada no apartamento *${apartamento}* (reserva: *${cod_reserva}*),`,
    `basta clicar no link abaixo e efetuar o pagamento de *R$ ${valor.toFixed(2)}*:`,
    ``,
    ``,
    `${url}`,
    ``,
    `Após a confirmação, enviaremos instruções de acesso.`,
    ``,
    `Qualquer dúvida, estamos à disposição!`
  ].join('\n');
}


module.exports = {
  criarMensagemPortaria,
  criarMensagemForest,
  criarMensagemCadastroConcluido,
  criarMensagemInstrucoesEntrada,
  criarMensagemBoasVindas,
  criarMensagemLimpezaExtra,
  criarMensagemInstrucoesSaida,
  criarMensagemPagamentoEarly,
  criarMensagemEarlyPago
};