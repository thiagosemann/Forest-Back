const connection = require('../connection2');
const apartamentosModel = require('../Airbnb/apartamentosAirbnbModel');
const axios = require('axios');
const ical = require('ical.js');
const moment = require('moment-timezone');
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
    faxina_userId // Nova coluna
  } = reserva;

  const insertReservaQuery = `
    INSERT INTO reservas 
    (apartamento_id, description, end_data, start_date, Observacoes, cod_reserva, link_reserva, limpeza_realizada, credencial_made, informed, check_in, check_out, faxina_userId) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    faxina_userId // Nova coluna
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


  // 1) Recupera e filtra apartamentos com link de calendário
  async function getApartamentosComLink() {
    const todos = await apartamentosModel.getAllApartamentos();
    // Se houver link_stays_calendario, prioriza ele e ignora os outros
    return todos.filter(a => a.link_stays_calendario || a.link_airbnb_calendario || a.link_booking_calendario);
  }


  /**
   * 2. Calcula datas de referência: hoje (zerado em horas) e limite (hoje + 3 meses)
   */
  function getDatasReferencia() {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const dataLimite = new Date(); dataLimite.setMonth(dataLimite.getMonth() + 3);
    return { hoje, dataLimite };
  }

  /**
   * 3. Busca e parseia o ICS de um apartamento em uma lista de vevents
   */
    async function fetchVevents(icsUrl) {
      const res = await axios.get(icsUrl);
      const jcal = ical.parse(res.data);
      const comp = new ical.Component(jcal);
      return comp.getAllSubcomponents('vevent');
    }

  /**
   * 4b) Extrai e normaliza os dados de um vevent
   */
  function parseEventoAirbnb(vevent, apartamento) {
    const toDate = prop => moment(prop.toString()).tz('America/Sao_Paulo').toDate();
    const start = toDate(vevent.getFirstPropertyValue('dtstart'));
    const end = toDate(vevent.getFirstPropertyValue('dtend'));
    const summary = vevent.getFirstPropertyValue('summary') || '';
    let cod_reserva, link_reserva;

    const desc = vevent.getFirstPropertyValue('description') || '';
    if (desc) {
      cod_reserva = desc.match(/\/details\/([A-Z0-9]+)/)?.[1];
      link_reserva = desc.match(/https:\/\/www\.airbnb\.com\/hosting\/reservations\/details\/[A-Z0-9]+/)?.[0];
    }

    if (!cod_reserva) return null;

    if (!link_reserva) {
      link_reserva = 'https://www.admforest.com.br/';
    }

    return { start, end, summary, cod_reserva, link_reserva };
  }
  
  // 4b) Parser específico para Booking
    function parseEventoBooking(vevent, apartamento) {
      const toDate = prop =>
        moment(prop.toString(), 'YYYYMMDD').tz('America/Sao_Paulo').startOf('day').toDate();
      const start = toDate(vevent.getFirstPropertyValue('dtstart'));
      const end = toDate(vevent.getFirstPropertyValue('dtend'));
      const summary = 'Reserved';
      const fmt = d => `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}${d.getFullYear()}`;
      const cod_reserva = `B-${apartamento.nome}${fmt(start)}`;
      const link_reserva = apartamento.link_booking_calendario || '';
      return { start, end, summary, cod_reserva, link_reserva };
    }

  // 4c) Parser específico para Stays
  function parseEventoStays(vevent, apartamento) {
    // Exemplo de DESCRIPTION:
    // DESCRIPTION:ID: ZV07I\nIDEX: pleeh-ZV07I\nDT: 2025-08-14\nIURL: \nIURLC: pl
    const toDate = prop => moment(prop.toString()).tz('America/Sao_Paulo').toDate();
    const start = toDate(vevent.getFirstPropertyValue('dtstart'));
    const end = toDate(vevent.getFirstPropertyValue('dtend'));
    let summary = vevent.getFirstPropertyValue('summary') || '';
    const desc = vevent.getFirstPropertyValue('description') || '';
    // Extrai o ID único
    let cod_reserva = null;
    const match = desc.match(/ID:\s*([\w-]+)/);
    if (match) {
      cod_reserva = `STAYS-${match[1]}`;
    }
    // Fallback: se não achar, gera um hash simples
    if (!cod_reserva) {
      cod_reserva = `STAYS-${Buffer.from(desc).toString('base64').slice(0,12)}`;
    }
    if(!cod_reserva.includes("IDEX")){
      summary = 'Reserved';
    }
    // O link_reserva pode ser vazio ou algum campo do stays
    let link_reserva = apartamento.link_stays_calendario || '';
    return { start, end, summary, cod_reserva, link_reserva };
  }

  //5. Processa todos os eventos de um apartamento:

    async function processarEventos(vevents, apartamento, hoje, dataLimite, parserFn) {
      const ativos = new Set();
      for (const vevent of vevents) {
        const parsed = parserFn(vevent, apartamento);
        if (!parsed) continue;
        const { start, end, summary, cod_reserva, link_reserva } = parsed;
        if (summary !== 'Reserved') continue; // só cria quando summary == 'Reserved'       
        if (end <= hoje || start > dataLimite) continue;
        ativos.add(cod_reserva);
        const [existing] = await connection.execute(
          'SELECT id, start_date, end_data, description FROM reservas WHERE cod_reserva = ?', [cod_reserva]
        );
        if (existing.length === 0) {
          await createReserva({ apartamento_id: apartamento.id, description: summary, start_date: start, end_data: end, Observacoes: '', cod_reserva, link_reserva, limpeza_realizada: false, credencial_made: false, informed: false, check_in: '15:00', check_out: '11:00', faxina_userId: null });
          if(start=== hoje){
            // Envia mensagem de reserva no dia da limpeza se for hoje    
              const limpezasHoje = await reservasModel.getFaxinasPorPeriodo(obj.start, obj.start);
              if (limpezasHoje.length > 0) {
                for(const limpeza in limpezasHoje) {
                  const limpezaObj = limpezasHoje[limpeza];
                  if(limpezaObj.apartamento_id === obj.apartamento_id) {
                    const apartamento = await apartamentosModel.getApartamentoById(obj.apartamento_id);
                    const user = await usersModel.getUser(limpezaObj.faxina_userId);
                    whatsControle.criarMensagemTercerizadaLimpezaReservaAtribuidaNoDia({
                      apartamento_name: apartamento.nome,
                      telefone: user.Telefone,
                    });
                  }
                }
              }  
          }
  
        } else {
          const db = existing[0];
          if (db.start_date.getTime() !== start.getTime() || db.end_data.getTime() !== end.getTime() || db.description !== summary) {
            await connection.execute('UPDATE reservas SET start_date = ?, end_data = ?, description = ? WHERE id = ?', [start, end, summary, db.id]);
          }
        }
      }
      return ativos;
    }

  /**
   * 6. Marca como CANCELADA reservas que não aparecem mais no iCal
   */
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


  /**
   * 7. Função principal de sincronização, agora orquestrando as funções acima
   */
    async function syncAirbnbReservations() {
      const aps = await getApartamentosComLink();
      const { hoje, dataLimite } = getDatasReferencia();
      for (const apt of aps) {
        try {
          const ativos = new Set();
          if (apt.link_stays_calendario) {
            // Se houver stays, só processa stays
            const evS = await fetchVevents(apt.link_stays_calendario);
            const codS = await processarEventos(evS, apt, hoje, dataLimite, parseEventoStays);
            codS.forEach(c => ativos.add(c));
          } else {
            if (apt.link_airbnb_calendario) {
              const evA = await fetchVevents(apt.link_airbnb_calendario);
              const codA = await processarEventos(evA, apt, hoje, dataLimite, parseEventoAirbnb);
              codA.forEach(c => ativos.add(c));
            }
            if (apt.link_booking_calendario) {
              const evB = await fetchVevents(apt.link_booking_calendario);
              const codB = await processarEventos(evB, apt, hoje, dataLimite, parseEventoBooking);
              codB.forEach(c => ativos.add(c));
            }
          }
          await cancelarReservasAusentes(apt.id, ativos, hoje);
        } catch (e) {
          console.error(`Erro no apt ${apt.id}:`, e.message);
        }
      }
      return { success: true, message: 'Sincronização concluída' };
    }

// Função de sincronização automática
const startAutoSync = () => {
  // Executa imediatamente
  syncAirbnbReservations().catch(error => {
    console.error('Erro na sincronização inicial:', error.message);
  });

  // Configura o intervalo de 5 minutos (300000 ms)
  setInterval(() => {
    syncAirbnbReservations().catch(error => {
      console.error('Erro na sincronização periódica:', error.message);
    });
  }, 300000); 
};

// Inicia o processo
startAutoSync();


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
    faxina_userId // Nova coluna
  } = reserva;

  const updateReservaQuery = `
    UPDATE reservas 
    SET apartamento_id = ?, description = ?, end_data = ?, start_date = ?, Observacoes = ?, cod_reserva = ?, link_reserva = ?, limpeza_realizada = ?, credencial_made = ?, informed = ?, check_in = ?, check_out = ?, faxina_userId = ?
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
    faxina_userId, // Nova coluna
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
      catch (e) { console.warn('Erro parse pagamentos:', e); reservasObj.pagamentos = []; }
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

module.exports = {
  getAllReservas,
  createReserva,
  getReservaById,
  getReservaByCod,
  getReservasByApartamentoId,
  updateReserva,
  deleteReserva,
  getReservasPorPeriodo,
  getFaxinasPorPeriodo,
  getReservasPorPeriodoCalendario,
  getReservasCanceladasHoje,
  getReservasPorPeriodoCalendarioPorApartamento,
  getReservasPorPeriodoByApartamentoID
};