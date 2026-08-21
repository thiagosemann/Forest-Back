const connection = require('../connection2');

// Motivo padrão das alocações feitas pela sincronização automática de reservas
const MOTIVO_SISTEMA = 'Gerado automaticamente pelo Sistema';

const TIPO_RESERVA = 'RESERVA';
const TIPO_LIMPEZA_EXTRA = 'LIMPEZA_EXTRA';

const SELECT_FIELDS = `
  a.id,
  a.tipo,
  a.referencia_id,
  a.apartamento_id,
  a.faxina_userId_anterior,
  a.faxina_user_nome_anterior,
  a.faxina_userId_novo,
  a.faxina_user_nome_novo,
  a.user_id,
  a.user_nome,
  a.origem,
  a.motivo,
  a.created_at
`;

const isTipoValido = (tipo) => tipo === TIPO_RESERVA || tipo === TIPO_LIMPEZA_EXTRA;

// Nome do usuário gravado como snapshot no registro (autor ou faxineira)
const getNomeUsuario = async (user_id) => {
  if (!user_id) return null;
  const [rows] = await connection.execute(
    'SELECT first_name, last_name FROM users WHERE id = ?',
    [user_id]
  );
  if (!rows.length) return null;
  const nome = `${rows[0].first_name || ''} ${rows[0].last_name || ''}`.trim();
  return nome || null;
};

// Estado atual da limpeza (responsável e data), usado para decidir se a troca precisa de justificativa
const getEstadoAtual = async (tipo, referencia_id) => {
  const tabela = tipo === TIPO_RESERVA ? 'reservas' : 'limpeza_extra';
  // `limpeza_extra` nao tem coluna description: a escala trata toda linha dela como LIMPEZA
  const campoDescricao = tipo === TIPO_RESERVA ? 'description' : "'LIMPEZA'";
  const [rows] = await connection.execute(
    `SELECT id, apartamento_id, faxina_userId, end_data, ${campoDescricao} AS description,
            DATE(end_data) <= CURDATE() AS data_passada
       FROM ${tabela} WHERE id = ?`,
    [referencia_id]
  );
  return rows[0] || null;
};

/**
 * Grava uma linha na planilha de alocações.
 * Chamado sempre que a faxineira de uma limpeza é definida ou trocada.
 */
const registrarAlocacao = async ({
  tipo,
  referencia_id,
  apartamento_id = null,
  faxina_userId_anterior = null,
  faxina_userId_novo = null,
  user_id = null,
  user_nome = null,
  origem = 'MANUAL',
  motivo
}) => {
  const [nomeAnterior, nomeNovo, nomeAutor] = await Promise.all([
    getNomeUsuario(faxina_userId_anterior),
    getNomeUsuario(faxina_userId_novo),
    user_nome ? Promise.resolve(user_nome) : getNomeUsuario(user_id)
  ]);

  const query = `
    INSERT INTO limpeza_alocacoes
      (tipo, referencia_id, apartamento_id,
       faxina_userId_anterior, faxina_user_nome_anterior,
       faxina_userId_novo, faxina_user_nome_novo,
       user_id, user_nome, origem, motivo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    tipo,
    referencia_id,
    apartamento_id || null,
    faxina_userId_anterior || null,
    nomeAnterior,
    faxina_userId_novo || null,
    nomeNovo,
    user_id || null,
    nomeAutor || (origem === 'SISTEMA' ? 'Sistema' : null),
    origem,
    motivo
  ];
  const [result] = await connection.execute(query, values);
  return getById(result.insertId);
};

const getById = async (id) => {
  const [rows] = await connection.execute(
    `SELECT ${SELECT_FIELDS} FROM limpeza_alocacoes a WHERE a.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Histórico completo de uma limpeza, do mais recente para o mais antigo
const getTimeline = async (tipo, referencia_id) => {
  const [rows] = await connection.execute(
    `SELECT ${SELECT_FIELDS}
       FROM limpeza_alocacoes a
      WHERE a.tipo = ? AND a.referencia_id = ?
      ORDER BY a.id DESC`,
    [tipo, referencia_id]
  );
  return rows;
};

const getUltima = async (tipo, referencia_id) => {
  const [rows] = await connection.execute(
    `SELECT ${SELECT_FIELDS}
       FROM limpeza_alocacoes a
      WHERE a.tipo = ? AND a.referencia_id = ?
      ORDER BY a.id DESC
      LIMIT 1`,
    [tipo, referencia_id]
  );
  return rows[0] || null;
};

/**
 * Última alocação de cada limpeza do período — é o que a escala exibe na coluna
 * "Alocado por". Uma única consulta evita um request por linha da tabela.
 */
const getUltimasPorPeriodo = async (inicio, fim, empresaId) => {
  let query = `
    SELECT ${SELECT_FIELDS},
           (SELECT COUNT(*) FROM limpeza_alocacoes c
             WHERE c.tipo = a.tipo AND c.referencia_id = a.referencia_id) AS total_alteracoes
      FROM limpeza_alocacoes a
      LEFT JOIN reservas r ON a.tipo = 'RESERVA' AND r.id = a.referencia_id
      LEFT JOIN limpeza_extra le ON a.tipo = 'LIMPEZA_EXTRA' AND le.id = a.referencia_id
      LEFT JOIN apartamentos ap ON ap.id = COALESCE(r.apartamento_id, le.apartamento_id)
     WHERE DATE(COALESCE(r.end_data, le.end_data)) BETWEEN ? AND ?
       AND a.id = (SELECT MAX(a2.id) FROM limpeza_alocacoes a2
                    WHERE a2.tipo = a.tipo AND a2.referencia_id = a.referencia_id)`;
  const params = [inicio, fim];
  if (empresaId) {
    query += ` AND EXISTS (SELECT 1 FROM apartamento_empresa ae
                            WHERE ae.apartamento_id = ap.id AND ae.empresa_id = ? AND ae.is_active = 1)`;
    params.push(empresaId);
  }
  const [rows] = await connection.execute(query, params);
  return rows;
};

/**
 * Backfill preguiçoso: limpezas alocadas antes desta planilha existir não têm
 * histórico. Na primeira abertura da timeline, o responsável atual vira o
 * primeiro registro. O NOT EXISTS impede duplicar se dois usuários abrirem juntos.
 */
const migrarAlocacaoLegado = async (tipo, referencia_id) => {
  const tabela = tipo === TIPO_RESERVA ? 'reservas' : 'limpeza_extra';
  const query = `
    INSERT INTO limpeza_alocacoes
      (tipo, referencia_id, apartamento_id, faxina_userId_novo, faxina_user_nome_novo,
       user_id, user_nome, origem, motivo)
    SELECT ?, t.id, t.apartamento_id, t.faxina_userId,
           NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''),
           NULL, 'Migração', 'MIGRACAO',
           'Alocação anterior ao controle de alterações'
      FROM ${tabela} t
      LEFT JOIN users u ON u.id = t.faxina_userId
     WHERE t.id = ?
       AND t.faxina_userId IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM limpeza_alocacoes a
          WHERE a.tipo = ? AND a.referencia_id = t.id
       )
  `;
  const [result] = await connection.execute(query, [tipo, referencia_id, tipo]);
  return result.affectedRows > 0;
};

module.exports = {
  MOTIVO_SISTEMA,
  TIPO_RESERVA,
  TIPO_LIMPEZA_EXTRA,
  isTipoValido,
  getEstadoAtual,
  registrarAlocacao,
  getById,
  getTimeline,
  getUltima,
  getUltimasPorPeriodo,
  migrarAlocacaoLegado
};
