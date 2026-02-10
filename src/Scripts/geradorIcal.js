/*
  geradorIcal.js

  Gera um arquivo ICS (iCalendar) para um apartamento com base nas reservas
  armazenadas no banco de dados. Objetivo: expor um calendário público que
  possa ser adicionado ao Airbnb/Booking para bloquear datas.

  - Exporta `gerarIcalTexto(apartamentoId, options)` que retorna o conteúdo
    do .ics como string.
  - Exporta `icalRoute(req, res)` — handler Express para `GET /apartamento-ical/:id`.

  Uso / opções:
  - Query `format=airbnb` (padrão) gera eventos com data/hora e timezone
    `America/Sao_Paulo`.
  - Query `format=booking` gera eventos em formato all-day (VALUE=DATE),
    compatível com o Booking.com.
  - O período consultado é limitado (hoje -1 ano até +2 anos). Ajuste se
    necessário no código.

  Observações de segurança:
  - A rota é pública para permitir que serviços externos (Airbnb/Booking)
    façam fetch do ICS. Se preferir controle de acesso, proteja a rota com
    token ou use um identificador público (ex: `cod_link_proprietario`) em vez
    do `id` numérico do apartamento.

  Exemplo de uso:
    GET /apartamento-ical/123?format=booking

*/

const reservasModel = require('../models/Airbnb/reservasAirbnbModel');
const apartamentosModel = require('../models/Airbnb/apartamentosAirbnbModel');
const moment = require('moment-timezone');

const TIMEZONE = 'America/Sao_Paulo';

function escapeText(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/\n/g, '\\n').replace(/\r/g, '').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

async function gerarIcalTexto(apartamentoId, options = {}) {
  const format = (options.format || 'airbnb').toLowerCase();
  const hoje = moment().startOf('day');
  const startDate = hoje.clone().subtract(1, 'year').format('YYYY-MM-DD');
  const endDate = hoje.clone().add(2, 'year').format('YYYY-MM-DD');

  const reservas = await reservasModel.getReservasPorPeriodoByApartamentoID(apartamentoId, startDate, endDate);
  const apartamento = await apartamentosModel.getApartamentoById ? await apartamentosModel.getApartamentoById(apartamentoId) : null;
  const calName = apartamento ? apartamento.nome : `Apartamento ${apartamentoId}`;

  const dtStamp = moment().utc().format('YYYYMMDDTHHmmss') + 'Z';

  let lines = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('PRODID:-//admforest//reservas//BR');
  lines.push('VERSION:2.0');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push(`X-WR-CALNAME:${escapeText(calName)}`);
  lines.push(`X-WR-TIMEZONE:${TIMEZONE}`);

  for (const r of reservas) {
    try {
      // Filtrar apenas reservas com origem FOREST
      if (r.origem !== 'FOREST') {
        continue;
      }
      const uid = `${r.cod_reserva || r.id}@admforest.com.br`;
      // Use timezone aware moments
      const start = moment(r.start_date);
      const end = moment(r.end_data);
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${escapeText(uid)}`);
      lines.push(`DTSTAMP:${dtStamp}`);
      if (format === 'booking') {
        // Booking expects all-day DATE values (VALUE=DATE), end is exclusive in iCal
        lines.push(`DTSTART;VALUE=DATE:${start.format('YYYYMMDD')}`);
        lines.push(`DTEND;VALUE=DATE:${end.format('YYYYMMDD')}`);
      } else {
        // Airbnb uses date-time with timezone
        lines.push(`DTSTART;TZID=${TIMEZONE}:${start.tz(TIMEZONE).format('YYYYMMDDTHHmmss')}`);
        lines.push(`DTEND;TZID=${TIMEZONE}:${end.tz(TIMEZONE).format('YYYYMMDDTHHmmss')}`);
      }
      const summary = r.description || 'Reserved';
      lines.push(`SUMMARY:${escapeText(summary)}`);
      let desc = 'ORIGEM:ADMFOREST';
      if (r.cod_reserva) desc += ` \\nCOD_RESERVA: ${r.cod_reserva}`;
      if (r.link_reserva) desc += ` \\nLINK: ${r.link_reserva}`;
      if (r.Observacoes) desc += ` \\nOBS: ${r.Observacoes}`;
      lines.push(`DESCRIPTION:${escapeText(desc)}`);
      // Provide a URL if available
      if (r.link_reserva) lines.push(`URL:${escapeText(r.link_reserva)}`);

      if (r.description === 'EXCLUIDA') {
        lines.push('STATUS:CANCELLED');
        lines.push('TRANSP:TRANSPARENT');
        lines.push('SEQUENCE:1');
      } else {
        lines.push('STATUS:CONFIRMED');
        lines.push('TRANSP:OPAQUE');
        lines.push('SEQUENCE:0');
      }

      lines.push('END:VEVENT');
    } catch (e) {
      // skip problematic reservation
      console.error('Erro gerando VEVENT:', e && e.message);
    }
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Express route handler
async function icalRoute(req, res) {
  try {
    const apartamentoId = req.params.id;
    const format = (req.query.format || 'airbnb').toLowerCase();
    const ics = await gerarIcalTexto(apartamentoId, { format });
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="apartamento-${apartamentoId}.ics"`);
    res.send(ics);
  } catch (err) {
    console.error('Erro ao gerar ICS:', err && err.message);
    res.status(500).json({ success: false, message: 'Erro ao gerar ICS', error: err.message });
  }
}

module.exports = { gerarIcalTexto, icalRoute };
