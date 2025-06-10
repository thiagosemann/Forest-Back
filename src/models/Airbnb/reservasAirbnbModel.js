const connection = require('../connection2');
const apartamentosModel = require('../Airbnb/apartamentosAirbnbModel');
const axios = require('axios');
const ical = require('ical.js');
const moment = require('moment-timezone');

// Função para buscar todas as reservas com o nome do apartamento
const getAllReservas = async () => {
  const query = `
    SELECT r.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
  `;
  const [reservas] = await connection.execute(query);
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

const syncAirbnbReservations = async () => {
  try {
    // 1. Recupera todos os apartamentos do banco
    const apartamentos = await apartamentosModel.getAllApartamentos();
    // 2. Filtra apenas os que têm link de calendário Airbnb configurado
    const apartmentsComLinks = apartamentos.filter(
      (a) => a.link_airbnb_calendario
    );

    // 3. Define o limite de busca: hoje + 3 meses
    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() + 3);

    // 4. 'hoje' zerado em horas para comparações apenas por data
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // 5. Itera sobre cada apartamento com link de calendário
    for (const apartamento of apartmentsComLinks) {
      try {
        // 5.1 Faz requisição HTTP ao ICS do Airbnb
        const response = await axios.get(apartamento.link_airbnb_calendario);
        // 5.2 Parseia o conteúdo iCal para objeto manipulável
        const jcalData = new ical.parse(response.data);
        const comp = new ical.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        // 5.3 Conjunto para guardar códigos de reservas ainda ativas
        const currentCodReservas = new Set();

        // 5.4 Processa cada evento (reserva) do iCal
        for (const vevent of vevents) {
          // 5.4.1 Extrai datas de início e fim, já convertidas para fuso de São Paulo
          const start = moment(
            vevent.getFirstPropertyValue('dtstart').toString()
          )
            .tz('America/Sao_Paulo')
            .toDate();
          const end = moment(
            vevent.getFirstPropertyValue('dtend').toString()
          )
            .tz('America/Sao_Paulo')
            .toDate();

          // 5.4.2 Ignora reservas concluídas (end <= hoje)
          if (end <= hoje) continue;
          // 5.4.3 Ignora reservas além do limite de 3 meses
          if (start > dataLimite) continue;

          // 5.4.4 Extrai código e link da descrição (UID personalizado)
          let cod_reserva, link_reserva;
          const desc = vevent.getFirstPropertyValue('description') || '';
          if (desc) {
            const mCode = desc.match(/\/details\/([A-Z0-9]+)/);
            const mLink = desc.match(
              /(https:\/\/www\.airbnb\.com\/hosting\/reservations\/details\/[A-Z0-9]+)/
            );
            cod_reserva = mCode?.[1];
            link_reserva = mLink?.[1];
          } else {
            // 5.4.5 Fallback: gera código a partir do nome e data fim
            const fmt = (d) =>
              `${String(d.getDate()).padStart(2, '0')}-${String(
                d.getMonth() + 1
              ).padStart(2, '0')}-${d.getFullYear()}`;
            cod_reserva = `${apartamento.nome}/${fmt(end)}`;
            link_reserva = 'https://www.admforest.com.br/';
          }
          // 5.4.6 Se faltar dados, pula o evento
          if (!cod_reserva || !link_reserva) continue;

          // 5.4.7 Adiciona ao conjunto de reservas ativas
          currentCodReservas.add(cod_reserva);

          // 5.4.8 Verifica se já existe no banco
          const [existing] = await connection.execute(
            'SELECT id, start_date, end_data FROM reservas WHERE cod_reserva = ?',
            [cod_reserva]
          );

          if (existing.length === 0) {
            // 5.4.9 Nova reserva: insere no banco
            const faxina_userId = null;
            await createReserva({
              apartamento_id: apartamento.id,
              description: vevent.getFirstPropertyValue('summary'),
              start_date: start,
              end_data: end,
              Observacoes: '',
              cod_reserva,
              link_reserva,
              limpeza_realizada: false,
              credencial_made: false,
              informed: false,
              check_in: '15:00',
              check_out: '11:00',
              faxina_userId,
            });
          } else {
            // 5.4.10 Reserva existente: atualiza datas e description se mudaram
            const dbStart = existing[0].start_date;
            const dbEnd = existing[0].end_data;
            const summary = vevent.getFirstPropertyValue('summary');
            if (
              dbStart.getTime() !== start.getTime() ||
              dbEnd.getTime() !== end.getTime() ||
              summary !== existing[0].description
            ) {
              await connection.execute(
                'UPDATE reservas SET start_date = ?, end_data = ?, description = ? WHERE id = ?',
                [start, end, summary, existing[0].id]
              );
            }
          }
        }

        // 6. Marca como CANCELADA reservas que sumiram do iCal e ainda são futuras
        const placeholders = Array.from(currentCodReservas)
          .map(() => '?')
          .join(',');
        if (currentCodReservas.size > 0) {
          await connection.execute(
            `UPDATE reservas
             SET description = 'CANCELADA'
             WHERE apartamento_id = ?
               AND cod_reserva NOT IN (${placeholders})
               AND end_data > ?`,
            [apartamento.id, ...Array.from(currentCodReservas), hoje]
          );
        } else {
          // Se não há reservas ativas no iCal, cancela todas as futuras
          await connection.execute(
            `UPDATE reservas
             SET description = 'CANCELADA'
             WHERE apartamento_id = ?
               AND end_data > ?`,
            [apartamento.id, hoje]
          );
        }
      } catch (err) {
        console.error(`Erro no apt ${apartamento.id}:`, err.message);
      }
    }

    return { success: true, message: 'Sincronização concluída' };
  } catch (error) {
    console.error('Erro geral na sincronização:', error.message);
    throw error;
  }
};


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
const getReservaById = async (id) => {
  const query = `
    SELECT r.*, 
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados 
    FROM reservas r 
    WHERE r.id = ?
  `;
  const [reservas] = await connection.execute(query, [id]);
  return reservas[0] || null;
};
// Função para buscar reservas pelo ID do apartamento
const getReservasByApartamentoId = async (apartamentoId) => {
  const query = `
    SELECT r.*, 
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados 
    FROM reservas r 
    WHERE r.apartamento_id = ?
  `;
  const [reservas] = await connection.execute(query, [apartamentoId]);
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
// Adicione no ReservasModel
const getReservasPorPeriodo = async (startDate, endDate) => {
  const query = `
    SELECT r.*, a.nome AS apartamento_nome, a.valor_limpeza,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE r.end_data BETWEEN ? AND ?
      AND r.cod_reserva NOT LIKE CONCAT('%', COALESCE(a.nome, 'Apartamento não encontrado'), '%')
    ORDER BY r.end_data ASC
  `;
  const [reservas] = await connection.execute(query, [startDate, endDate]);
  return reservas;
};
// Função para buscar reservas com start_date igual a hoje
// Função para buscar reservas com start_date igual a hoje, agora enriquecida
// com qtd_hospedes e array de horarioPrevistoChegada
const getReservasHoje = async () => {
  // 1) formata 'hoje' em SP
  const hoje = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD');

  // 2) busca as reservas do dia
  const query = `
    SELECT 
      r.*,
      COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
      a.senha_porta AS apartamento_senha,
      EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE DATE(r.start_date) = ?
      AND r.cod_reserva NOT LIKE CONCAT('%', COALESCE(a.nome, 'Apartamento não encontrado'), '%')
  `;
  const [reservas] = await connection.execute(query, [hoje]);

  // 3) para cada reserva, busca os check-ins associados
  for (const reserva of reservas) {
    const [checkins] = await connection.execute(
      `SELECT horarioPrevistoChegada
         FROM checkin
        WHERE reserva_id = ?`,
      [reserva.id]
    );

    // 4) adiciona as propriedades desejadas
    reserva.qtd_hospedes = checkins.length;
    reserva.horarioPrevistoChegada = checkins.map(ci => ci.horarioPrevistoChegada);
  }

  return reservas;
};

// Função para buscar reservas com start_date igual a amanhã
const getReservasAmanha = async () => {
  const amanha = moment().tz('America/Sao_Paulo').add(1, 'day').format('YYYY-MM-DD');
  const query = `
    SELECT r.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
            a.senha_porta AS apartamento_senha,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE DATE(r.start_date) = ?
      AND r.cod_reserva NOT LIKE CONCAT('%', COALESCE(a.nome, 'Apartamento não encontrado'), '%')
  `;
  const [reservas] = await connection.execute(query, [amanha]);
  return reservas;
};

// Função para buscar reservas futuras, excluindo hoje e amanhã
const getProximasReservas = async () => {
  const amanha = moment().tz('America/Sao_Paulo').add(1, 'day').format('YYYY-MM-DD');
  const query = `
    SELECT r.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
            a.senha_porta AS apartamento_senha,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE DATE(r.start_date) > ?
      AND r.cod_reserva NOT LIKE CONCAT('%', COALESCE(a.nome, 'Apartamento não encontrado'), '%')
    ORDER BY r.start_date ASC
  `;
  const [reservas] = await connection.execute(query, [amanha]);
  return reservas;
};

// Função para buscar reservas finalizadas com verificação de checkin
const getReservasFinalizadas = async () => {
  const hoje = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD');
  const query = `
    SELECT r.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
            a.senha_porta AS apartamento_senha,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE DATE(r.end_data) < ?
      AND r.cod_reserva NOT LIKE CONCAT('%', COALESCE(a.nome, 'Apartamento não encontrado'), '%')
    ORDER BY r.end_data DESC
  `;
  const [reservas] = await connection.execute(query, [hoje]);
  return reservas;
};

// Função para buscar reservas em andamento com verificação de checkin
const getReservasEmAndamento = async () => {
  const agoraSP = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
  const query = `
    SELECT r.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
            a.senha_porta AS apartamento_senha,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE r.start_date < ? AND r.end_data > ?
      AND r.cod_reserva NOT LIKE CONCAT('%', COALESCE(a.nome, 'Apartamento não encontrado'), '%')
  `;
  const [reservas] = await connection.execute(query, [agoraSP, agoraSP]);
  return reservas;
};


const getFaxinasPorPeriodo = async (inicio_end_data, fim_end_date) => {
  const query = `
    SELECT 
      r.*,
      a.nome AS apartamento_nome,
      a.senha_porta AS apartamento_senha,
      a.valor_limpeza,
      EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE r.faxina_userId IS NOT NULL
      AND r.end_data BETWEEN ? AND ?
    ORDER BY r.end_data ASC
  `;
  
  const [reservas] = await connection.execute(query, [inicio_end_data, fim_end_date]);
  return reservas;
};

module.exports = {
  getAllReservas,
  createReserva,
  getReservaById,
  getReservasByApartamentoId,
  updateReserva,
  deleteReserva,
  getReservasPorPeriodo,
  getReservasHoje,
  getReservasAmanha,
  getProximasReservas,
  getReservasFinalizadas,
  getReservasEmAndamento,
  getFaxinasPorPeriodo
};