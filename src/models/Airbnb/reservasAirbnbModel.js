const connection = require('../connection2');

// Função para buscar todas as reservas com o nome do apartamento
const getAllReservas = async (empresaId) => {
  let query = `
    SELECT r.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
  `;
  let params = [];
  if (empresaId) {
    query += ' WHERE a.empresa_id = ?';
    params.push(empresaId);
  }
  const [reservas] = await connection.execute(query, params);
  return reservas;
};
// Função para criar reserva (atualizada com cod_reserva e faxina_userId)
const createReserva = async (reserva) => {
  const { 
    apartamento_id, 
    description, 
    end_data, 
    start_date, 
    Observacoes, 
    cod_reserva, 
    link_reserva, 
    limpeza_realizada, 
    credencial_made, 
    informed, 
    check_in, 
    check_out,
    faxina_userId,
    telefone_principal = null // valor padrão null
  } = reserva;

  const insertReservaQuery = `
    INSERT INTO reservas 
    (apartamento_id, description, end_data, start_date, Observacoes, cod_reserva, link_reserva, limpeza_realizada, credencial_made, informed, check_in, check_out, faxina_userId, telefone_principal) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    apartamento_id, 
    description, 
    end_data, 
    start_date, 
    Observacoes, 
    cod_reserva, 
    link_reserva, 
    limpeza_realizada, 
    credencial_made, 
    informed, 
    check_in, 
    check_out,
    faxina_userId,
    telefone_principal // já será null se não vier
  ];

  try {
    // 1) Insere a reserva
    const [result] = await connection.execute(insertReservaQuery, values);
    const newReservaId = result.insertId;

    // 2) Atualiza qualquer checkin que tenha o mesmo cod_reserva
    const updateCheckinQuery = `
      UPDATE checkin
      SET reserva_id = ?
      WHERE cod_reserva = ?
    `;
    await connection.execute(updateCheckinQuery, [newReservaId, cod_reserva]);

    // 3) Retorna o ID da nova reserva
    return { insertId: newReservaId };
  } catch (error) {
    console.error('Erro ao inserir reserva ou vincular checkin:', error);
    throw error;
  }
};

// Função para buscar uma reserva pelo ID
const getReservaById = async (id, empresaId) => {
  let query = `
    SELECT r.*, 
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados 
    FROM reservas r 
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE r.id = ?`;
  let params = [id];
  if (empresaId) {
    query += ' AND a.empresa_id = ?';
    params.push(empresaId);
  }
  const [reservas] = await connection.execute(query, params);
  return reservas[0] || null;
};

// Função para buscar uma reserva pelo ID
const getReservaByCod = async (cod_reserva) => {
  const query = `
    SELECT r.*, 
           EXISTS (SELECT 1 FROM checkin c WHERE c.cod_reserva = r.cod_reserva) AS documentosEnviados 
    FROM reservas r 
    WHERE r.cod_reserva = ?
  `;
  const [reservas] = await connection.execute(query, [cod_reserva]);
  return reservas[0] || null;
};

// Buscar reservas por código de reserva (pode retornar múltiplas) com filtro opcional por empresa
const getReservasByCodReserva = async (cod_reserva, empresaId) => {
  let query = `
    SELECT r.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE r.cod_reserva = ?`;
  const params = [cod_reserva];
  if (empresaId) {
    query += ' AND a.empresa_id = ?';
    params.push(empresaId);
  }
  const [reservas] = await connection.execute(query, params);
  return reservas;
};

// Função para buscar reservas pelo ID do apartamento
const getReservasByApartamentoId = async (apartamentoId, empresaId) => {
  let query = `
    SELECT r.*, 
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados 
    FROM reservas r 
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE r.apartamento_id = ?`;
  let params = [apartamentoId];
  if (empresaId) {
    query += ' AND a.empresa_id = ?';
    params.push(empresaId);
  }
  const [reservas] = await connection.execute(query, params);
  return reservas;
};

// Função para atualizar reserva (atualizada com faxina_userId)
const updateReserva = async (reserva) => {
  const {
    id,
    apartamento_id,
    description,
    end_data,
    start_date,
    Observacoes,
    cod_reserva,
    link_reserva,
    limpeza_realizada,
    credencial_made,
    informed,
    check_in,
    check_out,
    faxina_userId,
    telefone_principal
  } = reserva;

  const updateReservaQuery = `
    UPDATE reservas 
    SET apartamento_id = ?, description = ?, end_data = ?, start_date = ?, Observacoes = ?, cod_reserva = ?, link_reserva = ?, limpeza_realizada = ?, credencial_made = ?, informed = ?, check_in = ?, check_out = ?, faxina_userId = ?, telefone_principal = ?
    WHERE id = ?
  `;

  const values = [
    apartamento_id,
    description,
    end_data,
    start_date,
    Observacoes,
    cod_reserva,
    link_reserva,
    limpeza_realizada,
    credencial_made,
    informed,
    check_in,
    check_out,
    faxina_userId,
    telefone_principal,
    id, // O ID deve ser o último valor, pois corresponde ao WHERE id = ?
  ];

  try {
    const [result] = await connection.execute(updateReservaQuery, values);
    return result.affectedRows > 0; // Retorna true se a reserva foi atualizada com sucesso
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    throw error;
  }
};

// Função para deletar uma reserva pelo ID
const deleteReserva = async (id) => {
  const deleteReservaQuery = 'DELETE FROM reservas WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteReservaQuery, [id]);
    return result.affectedRows > 0; // Retorna true se a reserva foi deletada com sucesso
  } catch (error) {
    console.error('Erro ao deletar reserva:', error);
    throw error;
  }
};

// Função para buscar reservas por período incluindo pagamentos via subquery
async function getReservasPorPeriodo(startDate, endDate, empresaId) {
  let query = `
    SELECT
      r.*,
      COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
      EXISTS(
        SELECT 1 FROM checkin c WHERE c.reserva_id = r.id
      ) AS documentosEnviados,
      (
        SELECT COUNT(*)
        FROM checkin c2
        WHERE c2.reserva_id = r.id
      ) AS qtd_hospedes,
      (
        SELECT JSON_ARRAYAGG(c2.horarioPrevistoChegada)
        FROM checkin c2
        WHERE c2.reserva_id = r.id
      ) AS horarioPrevistoChegada,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', p.id,
            'user_id', p.user_id,
            'valor_total', p.valor_total,
            'tipo_pagamento', p.tipo_pagamento,
            'tipo', p.tipo,
            'email_comprador', p.email_comprador,
            'date_criado', p.date_criado,
            'apartamento_id', p.apartamento_id,
            'cod_reserva', p.cod_reserva
          )
        )
        FROM pagamento_por_reserva_extra p
        WHERE p.reserva_id = r.id
      ) AS pagamentos
    FROM reservas r
    LEFT JOIN apartamentos a ON a.id = r.apartamento_id
    WHERE DATE(r.start_date) BETWEEN ? AND ?`;
  let params = [startDate, endDate];
  if (empresaId) {
    query += ' AND a.empresa_id = ?';
    params.push(empresaId);
  }
  query += ' ORDER BY r.start_date ASC';
  const [rows] = await connection.execute(query, params);

  // Trata possíveis formatos de retorno de JSON_ARRAYAGG do MySQL
  return rows.map(row => {
    const reservasObj = { ...row };

    // Horários de chegada
    if (!Array.isArray(reservasObj.horarioPrevistoChegada) && typeof reservasObj.horarioPrevistoChegada === 'string') {
      try { reservasObj.horarioPrevistoChegada = JSON.parse(reservasObj.horarioPrevistoChegada); }
      catch (e) { console.warn('Erro parse horarioPrevistoChegada:', e); reservasObj.horarioPrevistoChegada = []; }
    }
    if (!reservasObj.horarioPrevistoChegada) reservasObj.horarioPrevistoChegada = [];

    // Pagamentos
    if (!Array.isArray(reservasObj.pagamentos) && typeof reservasObj.pagamentos === 'string') {
      try { reservasObj.pagamentos = JSON.parse(reservasObj.pagamentos); }
      catch (e) { reservasObj.pagamentos = []; }
    }
    if (!reservasObj.pagamentos) reservasObj.pagamentos = [];

    return reservasObj;
  });
}
async function getReservasPorPeriodoByApartamentoID(apartamentoId, startDate, endDate) {
  const query = `
    SELECT
      r.*,
      COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
      EXISTS(
        SELECT 1 FROM checkin c WHERE c.reserva_id = r.id
      ) AS documentosEnviados,
      (
        SELECT COUNT(*)
        FROM checkin c2
        WHERE c2.reserva_id = r.id
      ) AS qtd_hospedes,
      (
        SELECT JSON_ARRAYAGG(c2.horarioPrevistoChegada)
        FROM checkin c2
        WHERE c2.reserva_id = r.id
      ) AS horarioPrevistoChegada,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', p.id,
            'user_id', p.user_id,
            'valor_total', p.valor_total,
            'tipo_pagamento', p.tipo_pagamento,
            'tipo', p.tipo,
            'email_comprador', p.email_comprador,
            'date_criado', p.date_criado,
            'apartamento_id', p.apartamento_id,
            'cod_reserva', p.cod_reserva
          )
        )
        FROM pagamento_por_reserva_extra p
        WHERE p.reserva_id = r.id
      ) AS pagamentos
    FROM reservas r
    LEFT JOIN apartamentos a ON a.id = r.apartamento_id
    WHERE r.apartamento_id = ? AND DATE(r.start_date) BETWEEN ? AND ?
    ORDER BY r.start_date ASC;
  `;

  const [rows] = await connection.execute(query, [apartamentoId, startDate, endDate]);

  // Trata possíveis formatos de retorno de JSON_ARRAYAGG do MySQL
  return rows.map(row => {
    const reservasObj = { ...row };

    // Horários de chegada
    if (!Array.isArray(reservasObj.horarioPrevistoChegada) && typeof reservasObj.horarioPrevistoChegada === 'string') {
      try { reservasObj.horarioPrevistoChegada = JSON.parse(reservasObj.horarioPrevistoChegada); }
      catch (e) { reservasObj.horarioPrevistoChegada = []; }
    }
    if (!reservasObj.horarioPrevistoChegada) reservasObj.horarioPrevistoChegada = [];

    // Pagamentos
    if (!Array.isArray(reservasObj.pagamentos) && typeof reservasObj.pagamentos === 'string') {
      try { reservasObj.pagamentos = JSON.parse(reservasObj.pagamentos); }
      catch (e) { reservasObj.pagamentos = []; }
    }
    if (!reservasObj.pagamentos) reservasObj.pagamentos = [];

    return reservasObj;
  });
}


const getFaxinasPorPeriodo = async (inicio_end_data, fim_end_date, empresaId) => {
  let query = `
    SELECT 
      r.*, 
      a.nome AS apartamento_nome,
      a.senha_porta AS apartamento_senha,
      a.endereco AS apartamento_endereco,
      a.bairro AS apartamento_bairro,
      a.valor_limpeza,
      EXISTS (
        SELECT 1 FROM reservas r2
        WHERE r2.apartamento_id = r.apartamento_id
          AND r2.start_date >= DATE(r.end_data)
          AND r2.start_date < DATE(r.end_data) + INTERVAL 1 DAY
          AND r2.description = 'Reserved'
      ) AS check_in_mesmo_dia,
      EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE r.description = 'Reserved'
      AND r.end_data BETWEEN ? AND ?`;
  let params = [inicio_end_data, fim_end_date];
  if (empresaId) {
    query += ' AND a.empresa_id = ?';
    params.push(empresaId);
  }
  query += ' ORDER BY r.end_data ASC';
  const [faxinas] = await connection.execute(query, params);
  return faxinas;
};

async function getReservasPorPeriodoCalendario(startDate, endDate, empresaId) {
  let query = `
    SELECT
      r.*,
      COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
      a.predio_id,
      EXISTS(
        SELECT 1 FROM checkin c WHERE c.reserva_id = r.id
      ) AS documentosEnviados,
      (
        SELECT COUNT(*) FROM checkin c2 WHERE c2.reserva_id = r.id
      ) AS qtd_hospedes,
      (
        SELECT JSON_ARRAYAGG(c2.horarioPrevistoChegada)
        FROM checkin c2 WHERE c2.reserva_id = r.id
      ) AS horarioPrevistoChegada,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', p.id,
            'user_id', p.user_id,
            'valor_total', p.valor_total,
            'tipo_pagamento', p.tipo_pagamento,
            'tipo', p.tipo,
            'email_comprador', p.email_comprador,
            'date_criado', p.date_criado,
            'apartamento_id', p.apartamento_id,
            'cod_reserva', p.cod_reserva
          )
        )
        FROM pagamento_por_reserva_extra p
        WHERE p.reserva_id = r.id
      ) AS pagamentos
    FROM reservas r
    LEFT JOIN apartamentos a ON a.id = r.apartamento_id
    WHERE 
      /* comece antes do final do mês */
      DATE(r.start_date) <= ? 
      AND 
      /* termine depois do início do mês */
      DATE(r.end_data) >= ?`;
  let params = [endDate, startDate];
  if (empresaId) {
    query += ' AND a.empresa_id = ?';
    params.push(empresaId);
  }
  query += ' ORDER BY r.start_date ASC';
  const [rows] = await connection.execute(query, params);

  return rows.map(row => {
    // parse de JSON_ARRAYAGG caso venha string
    ['horarioPrevistoChegada','pagamentos'].forEach(col => {
      if (row[col] && typeof row[col] === 'string') {
        try { row[col] = JSON.parse(row[col]); }
        catch { row[col] = []; }
      }
      if (!Array.isArray(row[col])) row[col] = [];
    });
    return row;
  });
}


async function getReservasCanceladasHoje(empresaId) {
  // Data de hoje (00:00:00) em São Paulo
  const hoje = moment().tz('America/Sao_Paulo').startOf('day').format('YYYY-MM-DD');

  let query = `
    SELECT r.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON a.id = r.apartamento_id
    WHERE ? BETWEEN DATE(r.start_date) AND DATE(r.end_data)
      AND r.description = 'CANCELADA'`;
  let params = [hoje];
  if (empresaId) {
    query += ' AND a.empresa_id = ?';
    params.push(empresaId);
  }
  query += ';';

  const [reservas] = await connection.execute(query, params);
  return reservas;
}

async function getReservasPorPeriodoCalendarioPorApartamento(startDate, endDate, apartamentoId, empresaId) {
  let query = `
    SELECT
      r.*,
      COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
      a.predio_id,
      EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id)              AS documentosEnviados,
      (SELECT COUNT(*)          FROM checkin c2 WHERE c2.reserva_id = r.id)   AS qtd_hospedes,
      (SELECT JSON_ARRAYAGG(c2.horarioPrevistoChegada)
         FROM checkin c2 WHERE c2.reserva_id = r.id)                          AS horarioPrevistoChegada,
      (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id',              p.id,
                  'user_id',         p.user_id,
                  'valor_total',     p.valor_total,
                  'tipo_pagamento',  p.tipo_pagamento,
                  'tipo',            p.tipo,
                  'email_comprador', p.email_comprador,
                  'date_criado',     p.date_criado,
                  'apartamento_id',  p.apartamento_id,
                  'cod_reserva',     p.cod_reserva
                )
       )
       FROM pagamento_por_reserva_extra p
       WHERE p.reserva_id = r.id)                                             AS pagamentos
    FROM reservas r
    LEFT JOIN apartamentos a ON a.id = r.apartamento_id
    WHERE r.apartamento_id = ? AND DATE(r.start_date) <= ? AND DATE(r.end_data)  >= ?`;
  let params = [apartamentoId, endDate, startDate];
  if (empresaId) {
    query += ' AND a.empresa_id = ?';
    params.push(empresaId);
  }
  query += ' ORDER BY r.start_date ASC';

  // atenção à ordem dos parâmetros!
  const [rows] = await connection.execute(query, params);

  // Normaliza colunas agregadas JSON (caso venham como string)
  return rows.map(row => {
    ['horarioPrevistoChegada', 'pagamentos'].forEach(col => {
      if (row[col] && typeof row[col] === 'string') {
        try { row[col] = JSON.parse(row[col]); }
        catch { row[col] = []; }
      }
      if (!Array.isArray(row[col])) row[col] = [];
    });
    return row;
  });
}
async function cancelarReservasAusentes(aptoId, ativos, hoje) {
  if (ativos.size) {
    const ph = Array.from(ativos).map(() => '?').join(',');
    await connection.execute(
      `UPDATE reservas 
      SET description = 'CANCELADA' 
      WHERE apartamento_id = ? 
        AND cod_reserva NOT IN (${ph}) 
        AND end_data > ? 
        AND description != 'CANCELADA-VERIFICADA'`,
      [aptoId, ...Array.from(ativos), hoje]
    );
  } else {
    await connection.execute(
      `UPDATE reservas 
      SET description = 'CANCELADA' 
      WHERE apartamento_id = ? 
        AND end_data > ? 
        AND description != 'CANCELADA-VERIFICADA'`,
      [aptoId, hoje]
    );
  }
}
module.exports = {
  getAllReservas,
  createReserva,
  getReservaById,
  getReservaByCod,
  getReservasByCodReserva,
  getReservasByApartamentoId,
  updateReserva,
  deleteReserva,
  getReservasPorPeriodo,
  getFaxinasPorPeriodo,
  getReservasPorPeriodoCalendario,
  getReservasCanceladasHoje,
  getReservasPorPeriodoCalendarioPorApartamento,
  getReservasPorPeriodoByApartamentoID,
  cancelarReservasAusentes
};

