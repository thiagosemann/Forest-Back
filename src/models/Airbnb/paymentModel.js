const connection = require('../connection2');

const criarPagamento = async (pagamento) => {
  const { user_id, valor_total, tipo_pagamento, email_comprador, date_criado, valor_real} = pagamento;
  
  // Verifica se já existe um pagamento com o mesmo user_id e date_criado
  const verificaPagamentoQuery = 'SELECT COUNT(*) AS total FROM pagamento_mercado_pago WHERE user_id = ? AND date_criado = ?';
  const [rows] = await connection.execute(verificaPagamentoQuery, [user_id, date_criado]);
  const totalPagamentos = rows[0].total;
  let valor_para_registrar = valor_total;
  if (totalPagamentos > 0) {
    return null; // Retorna null se o pagamento já existe
  }
  if(valor_real){
    valor_para_registrar = valor_real;
  }
  // Se não existir, insere o novo pagamento
  const inserirPagamentoQuery = 'INSERT INTO pagamento_mercado_pago (user_id, valor_total, tipo_pagamento, email_comprador, date_criado) VALUES (?, ?, ?, ?, ?)';
  const [result] = await connection.execute(inserirPagamentoQuery, [user_id, valor_para_registrar, tipo_pagamento, email_comprador, date_criado]);
  return { insertId: result.insertId };
};




const buscarPagamentosPorBuildingId = async (building_id, yearMonth) => {
  const [year, month] = yearMonth?.split('-').map(Number) || [];


  let queryMercadoPago = `
    SELECT
      'mercado_pago' AS origem,
      pmp.id,
      pmp.user_id,
      u.first_name AS user_name,
      pmp.valor_total,
      pmp.tipo_pagamento,
      pmp.email_comprador,
      pmp.date_criado
    FROM pagamento_mercado_pago pmp
    INNER JOIN users u ON pmp.user_id = u.id
    WHERE u.building_id = ?
  `;

  const queryParamsMercadoPago = [building_id];

  if (!isNaN(year) && !isNaN(month)) {
    queryMercadoPago += ' AND YEAR(pmp.date_criado) = ? AND MONTH(pmp.date_criado) = ?';
    queryParamsMercadoPago.push(year, month);
  }

  const [pagamentosMercadoPago] = await connection.execute(queryMercadoPago, queryParamsMercadoPago);

  return  pagamentosMercadoPago
  
};

const buscarPagamentosPorBuildingIdAndDateRange = async (building_id, startDate, endDate) => {
  // Query para pagamento_pagarme (tabela possui building_id diretamente)
  const queryPagarMe = `
    SELECT
      'pagarme' AS origem,
      pp.id,
      pp.user_id,
      u.first_name AS user_name,
      pp.building_id,
      pp.valor_total,
      pp.tipo_pagamento,
      pp.email_comprador,
      pp.date_criado,
      pp.payment_id
    FROM pagamento_pagarme pp
    INNER JOIN users u ON pp.user_id = u.id
    WHERE
      pp.building_id = ?
      AND pp.date_criado BETWEEN ? AND ?
  `;

  // Query para pagamento_mercado_pago (precisa buscar por building via users.building_id)
  const queryMercadoPago = `
    SELECT
      'mercado_pago' AS origem,
      pmp.id,
      pmp.user_id,
      u.first_name AS user_name,
      u.building_id,
      pmp.valor_total,
      pmp.tipo_pagamento,
      pmp.email_comprador,
      pmp.date_criado
    FROM pagamento_mercado_pago pmp
    INNER JOIN users u ON pmp.user_id = u.id
    WHERE
      u.building_id = ?
      AND pmp.date_criado BETWEEN ? AND ?
  `;

  const paramsPagarMe     = [building_id, startDate, endDate];
  const paramsMercadoPago = [building_id, startDate, endDate];

  const [pagamentosPagarMe] = await connection.execute(queryPagarMe, paramsPagarMe);
  const [pagamentosMercadoPago] = await connection.execute(queryMercadoPago, paramsMercadoPago);

  return [
    ...pagamentosPagarMe,
    ...pagamentosMercadoPago
  ];
};





module.exports = {
    criarPagamento,
    buscarPagamentosPorBuildingId,
    buscarPagamentosPorBuildingIdAndDateRange
};
