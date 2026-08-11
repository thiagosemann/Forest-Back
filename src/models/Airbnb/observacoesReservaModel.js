const connection = require('../connection2');

// Campos retornados em toda leitura da timeline.
// COALESCE no nome: se o usuário for removido, mantém o snapshot gravado no registro.
const SELECT_FIELDS = `
  o.id,
  o.reserva_id,
  o.cod_reserva,
  o.user_id,
  COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''), o.user_nome, 'Usuário removido') AS user_nome,
  o.texto,
  o.created_at,
  o.updated_at
`;

// Busca o nome atual do usuário para gravar como snapshot na observação
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

const createObservacao = async ({ reserva_id, cod_reserva, user_id, texto }) => {
  const user_nome = await getNomeUsuario(user_id);
  const query = `
    INSERT INTO reserva_observacoes (reserva_id, cod_reserva, user_id, user_nome, texto)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [reserva_id, cod_reserva, user_id || null, user_nome, texto];
  const [result] = await connection.execute(query, values);
  return getById(result.insertId);
};

const getById = async (id) => {
  const query = `
    SELECT ${SELECT_FIELDS}
    FROM reserva_observacoes o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = ? AND o.deleted_at IS NULL
  `;
  const [rows] = await connection.execute(query, [id]);
  return rows[0] || null;
};

// Timeline completa da reserva, do mais recente para o mais antigo
const getByReservaId = async (reserva_id) => {
  const query = `
    SELECT ${SELECT_FIELDS}
    FROM reserva_observacoes o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.reserva_id = ? AND o.deleted_at IS NULL
    ORDER BY o.created_at DESC, o.id DESC
  `;
  const [rows] = await connection.execute(query, [reserva_id]);
  return rows;
};

// Timeline pelo código da reserva (mesma reserva pode ter mais de um registro em `reservas`)
const getByCodReserva = async (cod_reserva) => {
  const query = `
    SELECT ${SELECT_FIELDS}
    FROM reserva_observacoes o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.cod_reserva = ? AND o.deleted_at IS NULL
    ORDER BY o.created_at DESC, o.id DESC
  `;
  const [rows] = await connection.execute(query, [cod_reserva]);
  return rows;
};

// Observação mais recente — é o que a coluna "observações" do diário exibe
const getUltimaByReservaId = async (reserva_id) => {
  const query = `
    SELECT ${SELECT_FIELDS}
    FROM reserva_observacoes o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.reserva_id = ? AND o.deleted_at IS NULL
    ORDER BY o.created_at DESC, o.id DESC
    LIMIT 1
  `;
  const [rows] = await connection.execute(query, [reserva_id]);
  return rows[0] || null;
};

// Retorna o registro cru (inclusive user_id) para checagem de autoria
const getRawById = async (id) => {
  const [rows] = await connection.execute(
    'SELECT * FROM reserva_observacoes WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return rows[0] || null;
};

const updateObservacao = async (id, texto) => {
  const [result] = await connection.execute(
    'UPDATE reserva_observacoes SET texto = ? WHERE id = ? AND deleted_at IS NULL',
    [texto, id]
  );
  if (result.affectedRows === 0) return null;
  return getById(id);
};

// Soft delete: o registro some da timeline mas o histórico continua auditável
const deleteObservacao = async (id) => {
  const [result] = await connection.execute(
    'UPDATE reserva_observacoes SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return result.affectedRows > 0;
};

// Backfill preguiçoso: reservas antigas guardavam a nota no campo único
// `reservas.Observacoes`. Na primeira leitura da timeline, esse texto vira o
// primeiro registro do histórico. O NOT EXISTS no próprio INSERT garante que
// dois usuários abrindo o modal ao mesmo tempo não criem registros duplicados.
const migrarObservacaoLegado = async (reserva_id) => {
  const query = `
    INSERT INTO reserva_observacoes (reserva_id, cod_reserva, user_id, user_nome, texto)
    SELECT r.id, r.cod_reserva, NULL, 'Migração', TRIM(r.Observacoes)
    FROM reservas r
    WHERE r.id = ?
      AND r.Observacoes IS NOT NULL
      AND TRIM(r.Observacoes) <> ''
      AND NOT EXISTS (
        SELECT 1 FROM reserva_observacoes o WHERE o.reserva_id = r.id
      )
  `;
  const [result] = await connection.execute(query, [reserva_id]);
  return result.affectedRows > 0;
};

module.exports = {
  createObservacao,
  migrarObservacaoLegado,
  getById,
  getRawById,
  getByReservaId,
  getByCodReserva,
  getUltimaByReservaId,
  updateObservacao,
  deleteObservacao
};
