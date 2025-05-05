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
    const [result] = await connection.execute(insertReservaQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir reserva:', error);
    throw error;
  }
};

const syncAirbnbReservations = async () => {
  try {
    const apartamentos = await apartamentosModel.getAllApartamentos();
    const apartmentsComLinks = apartamentos.filter(a => a.link_airbnb_calendario);
    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() + 3);

    for (const apartamento of apartmentsComLinks) {
      try {
        const response = await axios.get(apartamento.link_airbnb_calendario);
        const jcalData = new ical.parse(response.data);
        const comp = new ical.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');
        const currentCodReservas = new Set(); // Armazena códigos atuais

        for (const vevent of vevents) {
          const event = {
            summary: vevent.getFirstPropertyValue('summary'),
            startDate: moment(vevent.getFirstPropertyValue('dtstart').toString()).tz('America/Sao_Paulo').toDate(),
            endDate: moment(vevent.getFirstPropertyValue('dtend').toString()).tz('America/Sao_Paulo').toDate(),
            description: vevent.getFirstPropertyValue('description') || '',
            uid: vevent.getFirstPropertyValue('uid'),
          };

          if (event.startDate > dataLimite) continue;

          // Geração do código e link (mantido igual)
          let cod_reserva, link_reserva;
          if (event.description) {
            const codReservaMatch = event.description.match(/\/details\/([A-Z0-9]+)/);
            const linkMatch = event.description.match(/Reservation URL:\s*(https:\/\/www\.airbnb\.com\/hosting\/reservations\/details\/[A-Z0-9]+)/);
            cod_reserva = codReservaMatch?.[1];
            link_reserva = linkMatch?.[1];
          } else {
            const formatDate = (date) => `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            cod_reserva = `${apartamento.nome}/${formatDate(event.endDate)}`;
            link_reserva = "https://www.admforest.com.br/";
          }

          if (!cod_reserva || !link_reserva) {
            console.log('Dados incompletos:', event);
            continue;
          }

          currentCodReservas.add(cod_reserva); // Adiciona código à lista atual

          // Verifica existência e atualiza datas se necessário
          const [existing] = await connection.execute(
            'SELECT id, start_date, end_data FROM reservas WHERE cod_reserva = ?',
            [cod_reserva]
          );

          if (existing.length === 0) {
            const faxina_userId = await getFaxineiraId(event.endDate,apartamento.id)
            await createReserva({
              apartamento_id: apartamento.id,
              description: event.summary,
              start_date: event.startDate,
              end_data: event.endDate, // Corrigido typo 'end_data'
              Observacoes: '',
              cod_reserva: cod_reserva,
              link_reserva: link_reserva,
              limpeza_realizada: false,
              credencial_made: false,
              informed: false,
              check_in: "15:00",
              check_out: "11:00",
              faxina_userId: faxina_userId // Nova coluna, valor padrão
            });
          } else {
            // Comparação de datas para atualização
            const dbStart = existing[0].start_date;
            const dbEnd = existing[0].end_data;
            const shouldUpdate = dbStart.getTime() !== event.startDate.getTime() || 
                                dbEnd.getTime() !== event.endDate.getTime();

            if (shouldUpdate) {
              await connection.execute(
                'UPDATE reservas SET start_date = ?, end_data = ? WHERE id = ?',
                [event.startDate, event.endDate, existing[0].id]
              );
            }
          }
        }

          // Marca reservas canceladas (não presentes no calendário e com end_data no futuro)
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          
          if (currentCodReservas.size > 0) {
            await connection.execute(
              `UPDATE reservas 
              SET description = 'CANCELADA' 
              WHERE apartamento_id = ? 
              AND cod_reserva NOT IN (${Array.from(currentCodReservas).map(() => '?').join(',')}) 
              AND end_data > ?`,
              [apartamento.id, ...Array.from(currentCodReservas), hoje]
            );
          } else {
            await connection.execute(
              `UPDATE reservas 
              SET description = 'CANCELADA' 
              WHERE apartamento_id = ? 
              AND end_data > ?`,
              [apartamento.id, hoje]
            );
          }


      } catch (error) {
        console.error(`Erro no apartamento ${apartamento.id}:`, error.message);
      }
    }
    return { success: true, message: 'Sincronização concluída' };
  } catch (error) {
    console.error('Erro geral na sincronização:', error.message);
    throw error;
  }
};

const getFaxineiraId = async (day, apartamento_id) => {
  try {
    // Converte o datetime UTC para data local (SP) e formata
    const momentDay = moment(day).tz('America/Sao_Paulo');
    const formattedDay = momentDay.format('YYYY-MM-DD');

    // Mapeia o número do dia da semana para o nome em português
    const diasDaSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    let diaDaSemana = diasDaSemana[momentDay.day()];

    // Ajusta o nome para corresponder à coluna no banco (sem acentos)
    let colunaDia;
    if (diaDaSemana === 'terça') {
      colunaDia = 'terca';
    } else if (diaDaSemana === 'sábado') {
      colunaDia = 'sabado';
    } else {
      colunaDia = diaDaSemana;
    }

    // Passo 1: Buscar reservas do dia (ignorando faxina_userId nulo)
    const [reservas] = await connection.execute(
      "SELECT faxina_userId FROM reservas WHERE end_data = ? AND faxina_userId IS NOT NULL",
      [formattedDay]
    );

    // Calcula o somatório de faxinas por usuário com base nas reservas
    const somatorioFaxineiras = {};
    reservas.forEach(reserva => {
      const id = reserva.faxina_userId;
      somatorioFaxineiras[id] = (somatorioFaxineiras[id] || 0) + 1;
    });

    // Passo 2: Buscar a quantidade máxima de limpezas permitidas para cada faxineira no dia
    const [faxineiras] = await connection.execute(
      "SELECT * FROM quant_limpezas_por_dia"
    );

    // Passo 3: Obter as prioridades do apartamento
    const [apartamentos] = await connection.execute(
      "SELECT * FROM apartamentos WHERE id = ?",
      [apartamento_id]
    );
    const apartamento = apartamentos[0];
    if (!apartamento) {
      throw new Error("Apartamento não encontrado");
    }
    if (!apartamento.user_prioridade1 && !apartamento.user_prioridade2 && !apartamento.user_prioridade3 ) {
      // Se nenhuma prioridade estiver definida, retorna null
      return null;
    }

    // Organiza as prioridades (considera somente valores definidos)
    const prioridades = [apartamento.user_prioridade1, apartamento.user_prioridade2, apartamento.user_prioridade3].filter(userId => !!userId);

    // Função auxiliar para verificar se a faxineira pode receber outra faxina
    const podeFazerFaxina = (user_id) => {
      const registro = faxineiras.find(f => f.user_id === user_id);
      if (!registro) return false;
      const maxAllowed = registro[colunaDia];
      const currentCount = somatorioFaxineiras[user_id] || 0;
      return currentCount < maxAllowed;
    };

    // Verifica as faxineiras na ordem de prioridade
    for (const user_id of prioridades) {
      if (podeFazerFaxina(user_id)) {
        return user_id;
      }
    }

    // Caso nenhuma faxineira atenda os requisitos, retorna null
    return null;
  } catch (error) {
    console.error("Erro na getFaxineiraId:", error);
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
//startAutoSync();

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
    ORDER BY r.end_data ASC
  `;
  const [reservas] = await connection.execute(query, [startDate, endDate]);
  return reservas;
};

// Função para buscar reservas com start_date hoje e verificação de checkin
const getReservasHoje = async () => {
  const hoje = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD');
  const query = `
    SELECT r.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE DATE(r.start_date) = ?
  `;
  const [reservas] = await connection.execute(query, [hoje]);
  return reservas;
};

// Função para buscar reservas futuras com verificação de checkin
const getProximasReservas = async () => {
  const hoje = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD');
  const query = `
    SELECT r.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE DATE(r.start_date) > ?
    ORDER BY r.start_date ASC
  `;
  const [reservas] = await connection.execute(query, [hoje]);
  return reservas;
};

// Função para buscar reservas finalizadas com verificação de checkin
const getReservasFinalizadas = async () => {
  const hoje = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD');
  const query = `
    SELECT r.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE DATE(r.end_data) < ?
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
           EXISTS (SELECT 1 FROM checkin c WHERE c.reserva_id = r.id) AS documentosEnviados
    FROM reservas r
    LEFT JOIN apartamentos a ON r.apartamento_id = a.id
    WHERE r.start_date < ? AND r.end_data > ?
  `;
  const [reservas] = await connection.execute(query, [agoraSP, agoraSP]);
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
  getProximasReservas,
  getReservasFinalizadas,
  getReservasEmAndamento
};