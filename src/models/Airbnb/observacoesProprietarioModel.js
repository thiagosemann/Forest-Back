const connection = require('../connection2');

// Campos retornados em toda leitura da timeline.
// O nome do autor sai do cadastro atual; se o usuário for removido, cai no
// snapshot gravado na própria observação.
const SELECT_FIELDS = `
  o.id,
  o.proprietario_id,
  o.apartamento_id,
  a.nome AS apartamento_nome,
  TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))) AS proprietario_nome,
  o.user_id,
  COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''), o.user_nome, 'Usuário removido') AS user_nome,
  o.texto,
  o.created_at,
  o.updated_at
`;

const FROM_JOINS = `
  FROM proprietario_observacoes o
  LEFT JOIN users u ON u.id = o.user_id
  LEFT JOIN users p ON p.id = o.proprietario_id
  LEFT JOIN apartamentos a ON a.id = o.apartamento_id
`;

// Busca o nome atual do autor para gravar como snapshot na observação
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

const createObservacao = async ({ proprietario_id, apartamento_id, user_id, texto }) => {
  const user_nome = await getNomeUsuario(user_id);
  const query = `
    INSERT INTO proprietario_observacoes (proprietario_id, apartamento_id, user_id, user_nome, texto)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [proprietario_id, apartamento_id || null, user_id || null, user_nome, texto];
  const [result] = await connection.execute(query, values);
  return getById(result.insertId);
};

const getById = async (id) => {
  const query = `SELECT ${SELECT_FIELDS} ${FROM_JOINS} WHERE o.id = ? AND o.deleted_at IS NULL`;
  const [rows] = await connection.execute(query, [id]);
  return rows[0] || null;
};

// Retorna o registro cru (inclusive user_id) para checagem de autoria
const getRawById = async (id) => {
  const [rows] = await connection.execute(
    'SELECT * FROM proprietario_observacoes WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return rows[0] || null;
};

// Timeline completa do proprietário, do mais recente para o mais antigo
const getByProprietarioId = async (proprietario_id) => {
  const query = `
    SELECT ${SELECT_FIELDS} ${FROM_JOINS}
    WHERE o.proprietario_id = ? AND o.deleted_at IS NULL
    ORDER BY o.created_at DESC, o.id DESC
  `;
  const [rows] = await connection.execute(query, [proprietario_id]);
  return rows;
};

// Timeline vista pela tela de apartamentos: como o apartamento pertence ao
// proprietário, mostramos todas as notas dos proprietários vinculados a ele
// — não só as que foram escritas a partir deste apartamento.
const getByApartamentoId = async (apartamento_id) => {
  const query = `
    SELECT ${SELECT_FIELDS} ${FROM_JOINS}
    WHERE o.deleted_at IS NULL
      AND o.proprietario_id IN (
        SELECT ap.user_id FROM apartamento_proprietario ap WHERE ap.apartamento_id = ?
      )
    ORDER BY o.created_at DESC, o.id DESC
  `;
  const [rows] = await connection.execute(query, [apartamento_id]);
  return rows;
};

// Proprietários vinculados ao apartamento — define a quem uma nova nota
// criada pela tela de apartamentos será atribuída
const getProprietariosDoApartamento = async (apartamento_id) => {
  const query = `
    SELECT u.id, TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))) AS nome
    FROM users u
    INNER JOIN apartamento_proprietario ap ON ap.user_id = u.id
    WHERE ap.apartamento_id = ?
    ORDER BY nome
  `;
  const [rows] = await connection.execute(query, [apartamento_id]);
  return rows;
};

// Observação mais recente do proprietário
const getUltimaByProprietarioId = async (proprietario_id) => {
  const query = `
    SELECT ${SELECT_FIELDS} ${FROM_JOINS}
    WHERE o.proprietario_id = ? AND o.deleted_at IS NULL
    ORDER BY o.created_at DESC, o.id DESC
    LIMIT 1
  `;
  const [rows] = await connection.execute(query, [proprietario_id]);
  return rows[0] || null;
};

const updateObservacao = async (id, texto) => {
  const [result] = await connection.execute(
    'UPDATE proprietario_observacoes SET texto = ? WHERE id = ? AND deleted_at IS NULL',
    [texto, id]
  );
  if (result.affectedRows === 0) return null;
  return getById(id);
};

// Soft delete: o registro some da timeline mas o histórico continua auditável
const deleteObservacao = async (id) => {
  const [result] = await connection.execute(
    'UPDATE proprietario_observacoes SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  createObservacao,
  getById,
  getRawById,
  getByProprietarioId,
  getByApartamentoId,
  getProprietariosDoApartamento,
  getUltimaByProprietarioId,
  updateObservacao,
  deleteObservacao
};
