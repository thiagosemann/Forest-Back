const apartamentosModel = require('../models/Airbnb/apartamentosAirbnbModel');
const reservasModel = require('../models/Airbnb/reservasAirbnbModel');
const axios = require('axios');
const ical = require('ical.js');
const moment = require('moment-timezone');
const whatsControle = require('../WhatsApp/whats_Controle');
const connection = require('../models/connection2');


// 1) Recupera e filtra apartamentos com link de calendário
async function getApartamentosComLink() {
  const todos = await apartamentosModel.getAllApartamentos();
  return todos.filter(a => a.link_stays_calendario || a.link_airbnb_calendario || a.link_booking_calendario);
}

function getDatasReferencia() {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const dataLimite = new Date(); dataLimite.setMonth(dataLimite.getMonth() + 3);
  return { hoje, dataLimite };
}

async function fetchVevents(icsUrl) {
  let res;
  try {
    res = await axios.get(icsUrl);
    if (!res.data || !res.data.includes('BEGIN:VEVENT')) {
      return { eventos: [], erro: false };
    }
    const jcal = ical.parse(res.data);
    const comp = new ical.Component(jcal);
    return { eventos: comp.getAllSubcomponents('vevent'), erro: false };
  } catch (e) {
    const status = e.response?.status;
    if (status) {
      console.warn(` Falha ao buscar ICS (${status}) para ${icsUrl}: ${e.response?.data || e.message}`);
      return { eventos: [], erro: true, msg: `Falha ao buscar ICS (${status})`, status };
    }
    console.error('Erro ao processar ICS:', icsUrl, e, res ? res.data : null);
    return { eventos: [], erro: true, msg: e.message, status: null };
  }
}

function parseEventoAirbnb(vevent, apartamento) {
  const toDate = prop => moment(prop.toString()).tz('America/Sao_Paulo').toDate();
  const start = toDate(vevent.getFirstPropertyValue('dtstart'));
  const end = toDate(vevent.getFirstPropertyValue('dtend'));
  const summary = vevent.getFirstPropertyValue('summary') || '';
  let cod_reserva, link_reserva;
  const desc = vevent.getFirstPropertyValue('description') || '';
  if (desc) {
    cod_reserva = desc.match(/\/details\/([A-Z0-9]+)/)?.[1];
    link_reserva = desc.match(/https:\/\/www\\.airbnb\\.com\/hosting\/reservations\/details\/[A-Z0-9]+/)?.[0];
  }
  if (!cod_reserva) return null;
  if (!link_reserva) {
    link_reserva = 'https://www.admforest.com.br/';
  }
  return { start, end, summary, cod_reserva, link_reserva };
}

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

function parseEventoStays(vevent, apartamento) {
  const toDate = prop => moment(prop.toString()).tz('America/Sao_Paulo').toDate();
  const start = toDate(vevent.getFirstPropertyValue('dtstart'));
  const end = toDate(vevent.getFirstPropertyValue('dtend'));
  let summary = vevent.getFirstPropertyValue('summary') || '';
  const desc = vevent.getFirstPropertyValue('description') || '';
  let cod_reserva = null;
  const match = desc.match(/ID:\s*([\w-]+)/);
  if (match) {
    cod_reserva = `STAYS-${match[1]}`;
  }
  if (!cod_reserva) {
    cod_reserva = `STAYS-${Buffer.from(desc).toString('base64').slice(0,12)}`;
  }
  if(!cod_reserva.includes("IDEX")){
    summary = 'Reserved';
  }
  let link_reserva = apartamento.link_stays_calendario || '';
  return { start, end, summary, cod_reserva, link_reserva };
}

async function processarEventos(vevents, apartamento, hoje, dataLimite, parserFn) {
  const ativos = new Set();
  let criadas = 0;
  for (const vevent of vevents) {
    const parsed = parserFn(vevent, apartamento);
    if (!parsed) continue;
    const { start, end, summary, cod_reserva, link_reserva } = parsed;
    if (summary !== 'Reserved') continue;
    if (end <= hoje || start > dataLimite) continue;
    ativos.add(cod_reserva);
    const [existing] = await connection.execute(
      'SELECT id, start_date, end_data, description FROM reservas WHERE cod_reserva = ?', [cod_reserva]
    );
    if (existing.length === 0) {
      await reservasModel.createReserva({ apartamento_id: apartamento.id, description: summary, start_date: start, end_data: end, Observacoes: '', cod_reserva, link_reserva, limpeza_realizada: false, credencial_made: false, informed: false, check_in: '15:00', check_out: '11:00', faxina_userId: null });
      criadas++;
      if(start=== hoje){
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
  return { ativos, criadas };
}

const BATCH_SIZE = 3;
const DELAY_BETWEEN_CYCLES_MS = 5 * 60 * 1000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processarApartamento(apt, hoje, dataLimite) {
  try {
    let criadas = 0;
    let canceladas = 0;
    const ativos = new Set();
    let icsVazio = false;
    let icsErro = false;
    let erroMsg = '';
    let erroStatus = null;
    if (apt.link_stays_calendario) {
      const { eventos: evS, erro, msg, status } = await fetchVevents(apt.link_stays_calendario);
      if (erro) { icsErro = true; erroMsg = msg; erroStatus = status; }
      else if (evS.length === 0) icsVazio = true;
      const { ativos: codS, criadas: criadasS } = await processarEventos(evS, apt, hoje, dataLimite, parseEventoStays);
      codS.forEach(c => ativos.add(c));
      criadas += criadasS;
    } else {
      if (apt.link_airbnb_calendario) {
        const { eventos: evA, erro, msg, status } = await fetchVevents(apt.link_airbnb_calendario);
        if (erro) { icsErro = true; erroMsg = msg; erroStatus = status; }
        else if (evA.length === 0) icsVazio = true;
        const { ativos: codA, criadas: criadasA } = await processarEventos(evA, apt, hoje, dataLimite, parseEventoAirbnb);
        codA.forEach(c => ativos.add(c));
        criadas += criadasA;
      }
      if (apt.link_booking_calendario) {
        const { eventos: evB, erro, msg, status } = await fetchVevents(apt.link_booking_calendario);
        if (erro) { icsErro = true; erroMsg = msg; erroStatus = status; }
        else if (evB.length === 0) icsVazio = true;
        const { ativos: codB, criadas: criadasB } = await processarEventos(evB, apt, hoje, dataLimite, parseEventoBooking);
        codB.forEach(c => ativos.add(c));
        criadas += criadasB;
      }
    }
    // Canceladas
    if (typeof reservasModel.cancelarReservasAusentes === 'function') {
      const canceladasCount = await reservasModel.cancelarReservasAusentes(apt.id, ativos, hoje);
      if (typeof canceladasCount === 'number') canceladas = canceladasCount;
    } else {
      await reservasModel.cancelarReservasAusentes(apt.id, ativos, hoje);
    }
    if (icsErro) {
      return { id: apt.id, nome: apt.nome, empresa_id: apt.empresa_id, status: 'erro', error: erroMsg, errorCode: erroStatus, criadas, canceladas };
    }
    if (icsVazio) {
      return { id: apt.id, nome: apt.nome, empresa_id: apt.empresa_id, status: 'sem_reservas', criadas, canceladas };
    }
    return { id: apt.id, nome: apt.nome, empresa_id: apt.empresa_id, status: 'ok', criadas, canceladas };
  } catch (e) {
    console.error(`[Airbnb Sync] Erro no apt ${apt.id}:`, e.message);
    return { id: apt.id, nome: apt.nome, empresa_id: apt.empresa_id, status: 'erro', error: e.message, criadas: 0, canceladas: 0 };
  }
}

async function syncAirbnbReservations() {
  console.log(' Inicializando sincronização de reservas...');
  const startTime = Date.now();
  const aps = await getApartamentosComLink();
  const { hoje, dataLimite } = getDatasReferencia();
  let totalAtualizados = 0;
  let totalErros = 0;
  let totalSemReservas = 0;
  let totalProcessado = 0;
  let totalCriadas = 0;
  let totalCanceladas = 0;
  let errosArr = [];
  for (let i = 0; i < aps.length; i += BATCH_SIZE) {
    const batch = aps.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(apt => processarApartamento(apt, hoje, dataLimite))
    );
    results.forEach(r => {
      totalProcessado++;
      if (r.status === 'fulfilled' && r.value?.status === 'ok') totalAtualizados++;
      else if (r.status === 'fulfilled' && r.value?.status === 'sem_reservas') totalSemReservas++;
      else {
        totalErros++;
        if (r.status === 'fulfilled' && r.value?.status === 'erro') {
          errosArr.push({ nome: r.value.nome, empresa_id: r.value.empresa_id, error: r.value.error, errorCode: r.value.errorCode });
        } else if (r.status === 'rejected') {
          errosArr.push({ nome: 'Desconhecido', empresa_id: null, error: r.reason?.message || 'Erro desconhecido', errorCode: null });
        }
      }
      // Contabiliza reservas criadas/canceladas se retornado pelo processarApartamento
      if (r.status === 'fulfilled' && r.value?.criadas) totalCriadas += r.value.criadas;
      if (r.status === 'fulfilled' && r.value?.canceladas) totalCanceladas += r.value.canceladas;
    });
  }
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const erroWhatsapp = {
    TotalProcessado: totalProcessado,
    TotalAtualizados: totalAtualizados,
    TotalSemReservas: totalSemReservas,
    TotalErros: totalErros,
    TotalCriadas: totalCriadas,
    TotalCanceladas: totalCanceladas,
    Tempo: `${elapsed}s`,
    Erros: errosArr
  };
  await whatsControle.criarMensagemErrosSincronização(erroWhatsapp);
}

async function startAutoSync() {
  while (true) {
    await syncAirbnbReservations();
    console.log(` Aguardando ${DELAY_BETWEEN_CYCLES_MS / 60000} minutos para próximo ciclo...`);
    await sleep(DELAY_BETWEEN_CYCLES_MS);
  }
}

// Função para validar um ICS recebido do frontend
async function validarIcal(icalData) {
  try {
    let eventos = [];
    let erro = null;
    let icsText = icalData;

    // Se for uma URL, faz o download do conteúdo
    if (typeof icalData === 'string' && icalData.startsWith('http')) {
      try {
        const res = await axios.get(icalData);
        icsText = res.data;
      } catch (e) {
        return { success: false, message: 'Erro ao baixar ICS da URL.', error: e.message };
      }
    }

    if (!icsText || typeof icsText !== 'string') {
      return { success: false, message: 'ICS inválido ou não enviado.' };
    }
    let jcal;
    try {
      jcal = ical.parse(icsText);
    } catch (e) {
      return { success: false, message: 'Falha ao parsear ICS.', error: e.message };
    }
    try {
      const comp = new ical.Component(jcal);
      eventos = comp.getAllSubcomponents('vevent');
    } catch (e) {
      erro = e.message;
    }
    if (erro) {
      return { success: false, message: 'Erro ao processar eventos do ICS.', error: erro };
    }
    if (!eventos || eventos.length === 0) {
      return { success: true, valido: true, possuiEventos: false, message: 'ICS válido, mas sem eventos.' };
    }
    return { success: true, valido: true, possuiEventos: true, quantidadeEventos: eventos.length, message: 'ICS válido e possui eventos.' };
  } catch (err) {
    return { success: false, message: 'Erro inesperado ao validar ICS.', error: err.message };
  }
}

// Função para validar um ICS recebido do frontend (rota Express)
async function validarIcalRoute(req, res) {
  try {
    const { icalData } = req.body;
    const result = await validarIcal(icalData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao validar ICS', error: err.message });
  }
}

module.exports = {
  validarIcalRoute
};

startAutoSync();