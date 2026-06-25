const connection = require('../models/connection2');
const cron = require('node-cron');

const DIAS_RETENCAO = 90;

async function executarLimpeza() {
  const dataCorte = new Date();
  dataCorte.setDate(dataCorte.getDate() - DIAS_RETENCAO);
  const dataCorteStr = dataCorte.toISOString().split('T')[0];

  const [comCheckin] = await connection.execute(`
    SELECT uf.user_id,
           LENGTH(IFNULL(uf.imagemBase64,'')) + LENGTH(IFNULL(uf.documentBase64,'')) AS bytes
    FROM user_files uf
    JOIN checkin ch ON ch.user_id = uf.user_id
    JOIN reservas r  ON r.id = ch.reserva_id
    WHERE uf.imagemBase64 IS NOT NULL OR uf.documentBase64 IS NOT NULL
    GROUP BY uf.user_id, uf.imagemBase64, uf.documentBase64
    HAVING MAX(r.end_data) < ?
  `, [dataCorteStr]);

  const [semCheckin] = await connection.execute(`
    SELECT uf.user_id,
           LENGTH(IFNULL(uf.imagemBase64,'')) + LENGTH(IFNULL(uf.documentBase64,'')) AS bytes
    FROM user_files uf
    WHERE (uf.imagemBase64 IS NOT NULL OR uf.documentBase64 IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM checkin ch WHERE ch.user_id = uf.user_id)
  `);

  const candidatos = [...comCheckin, ...semCheckin];

  if (candidatos.length === 0) {
    console.log('[limpezaUserFiles] Nenhum registro para limpar.');
    return;
  }

  const totalMB = parseFloat(
    (candidatos.reduce((acc, r) => acc + Number(r.bytes || 0), 0) / 1024 / 1024).toFixed(2)
  );

  const placeholders = candidatos.map(() => '?').join(',');
  await connection.execute(
    `UPDATE user_files SET imagemBase64 = NULL, documentBase64 = NULL WHERE user_id IN (${placeholders})`,
    candidatos.map(r => r.user_id)
  );

  console.log(`[limpezaUserFiles] ${candidatos.length} registros limpos, ~${totalMB} MB liberados (corte: ${dataCorteStr})`);
}

console.log('[limpezaUserFiles] Agendado para todo dia às 03:00 (America/Sao_Paulo)');

cron.schedule('0 3 * * *', () => {
  console.log('[limpezaUserFiles] Iniciando limpeza...');
  executarLimpeza().catch(err => console.error('[limpezaUserFiles] Erro:', err.message));
}, { timezone: 'America/Sao_Paulo' });
