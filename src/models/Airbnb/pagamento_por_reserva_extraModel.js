const connection = require('../connection2');

async function criarPagamentoPorReservaExtra(pagamento) {
  const {
    user_id,
    valor_total,
    tipo_pagamento,
    tipo,
    email_comprador,
    date_criado,
    reserva_id,
    apartamento_id,
    cod_reserva
  } = pagamento;

  // 1) Verifica duplicidade por cod_reserva
  if (cod_reserva) {
    const verificaQuery = `
      SELECT COUNT(*) AS total
        FROM pagamento_por_reserva_extra
       WHERE cod_reserva = ?
    `;
    const [rows] = await connection.execute(verificaQuery, [cod_reserva]);
    if (rows[0].total > 0) {
      return null;
    }
  }

  // 2) Insere novo registro
  const insertQuery = `
    INSERT INTO pagamento_por_reserva_extra
      (user_id, valor_total, tipo_pagamento, tipo, email_comprador, date_criado,
       reserva_id, apartamento_id, cod_reserva)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    user_id,
    valor_total,
    tipo_pagamento || null,
    tipo || null,
    email_comprador || null,
    date_criado || null,
    reserva_id || null,
    apartamento_id || null,
    cod_reserva || null
  ];
  const [result] = await connection.execute(insertQuery, params);
  return { insertId: result.insertId };
}

async function buscarPagamentoPorId(id) {
  const query = `
    SELECT *
      FROM pagamento_por_reserva_extra
     WHERE id = ?
     LIMIT 1
  `;
  const [rows] = await connection.execute(query, [id]);
  return rows[0] || null;
}


async function buscarPagamentosPorReservaId(reserva_id) {
  const query = `
    SELECT *
      FROM pagamento_por_reserva_extra
     WHERE reserva_id = ?
  `;
  const [rows] = await connection.execute(query, [reserva_id]);
  return rows;
}


async function buscarPagamentosPorApartamentoId(apartamento_id) {
  const query = `
    SELECT *
      FROM pagamento_por_reserva_extra
     WHERE apartamento_id = ?
  `;
  const [rows] = await connection.execute(query, [apartamento_id]);
  return rows;
}

module.exports = {
  criarPagamentoPorReservaExtra,
  buscarPagamentoPorId,
  buscarPagamentosPorReservaId,
  buscarPagamentosPorApartamentoId
};
