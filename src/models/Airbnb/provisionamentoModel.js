const connection = require('../connection2');

// Normaliza ISO/string para YYYY-MM-DD (colunas DATE)
const normalizeDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }
  return null;
};

const ensureAllowedValue = (value, allowed, fieldName) => {
  if (value === undefined || value === null) return value;
  if (!allowed.includes(value)) {
    throw new Error(`${fieldName} inválido. Use: ${allowed.join(', ')}`);
  }
  return value;
};

// SELECT base com dados de vínculo/apartamento e status efetivo (ATRASADO derivado)
const SELECT_BASE = `
  SELECT
    p.*,
    CASE
      WHEN p.status = 'PENDENTE' AND p.data_prevista IS NOT NULL AND p.data_prevista < CURDATE()
      THEN 'ATRASADO'
      ELSE p.status
    END AS status_efetivo,
    a.nome AS apartamento_nome,
    a.is_active AS apartamento_ativo,
    TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))) AS proprietario_nome
  FROM provisionamentos p
  LEFT JOIN apartamentos a ON p.apartamento_id = a.id
  LEFT JOIN users u ON p.vinculo_id = u.id
`;

// Constrói cláusulas WHERE de filtro (período/tipo) reaproveitáveis
const buildFilters = (empresaId, filtros = {}) => {
  const clauses = ['p.empresa_id = ?'];
  const params = [empresaId];

  const inicio = normalizeDate(filtros.dataInicio);
  const fim = normalizeDate(filtros.dataFim);
  // Filtra pela data prevista (ou realizada quando já liquidado)
  if (inicio) {
    clauses.push('COALESCE(p.data_realizada, p.data_prevista) >= ?');
    params.push(inicio);
  }
  if (fim) {
    clauses.push('COALESCE(p.data_realizada, p.data_prevista) <= ?');
    params.push(fim);
  }
  if (filtros.tipo && ['entrada', 'saida'].includes(filtros.tipo)) {
    clauses.push('p.tipo = ?');
    params.push(filtros.tipo);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
};

// Lista todos os provisionamentos da empresa (com filtros opcionais de período/tipo)
const getAll = async (empresaId, filtros = {}) => {
  const { where, params } = buildFilters(empresaId, filtros);
  const query = `${SELECT_BASE} ${where} ORDER BY COALESCE(p.data_realizada, p.data_prevista) DESC, p.created_at DESC`;
  const [rows] = await connection.execute(query, params);
  return rows;
};

// Busca um provisionamento por id (garante isolamento por empresa)
const getById = async (id, empresaId) => {
  const query = `${SELECT_BASE} WHERE p.id = ? AND p.empresa_id = ?`;
  const [rows] = await connection.execute(query, [id, empresaId]);
  return rows.length ? rows[0] : null;
};

// Resumo agregado por status efetivo x tipo, no período selecionado
const getResumo = async (empresaId, filtros = {}) => {
  const { where, params } = buildFilters(empresaId, filtros);
  const query = `
    SELECT
      CASE
        WHEN p.status = 'PENDENTE' AND p.data_prevista IS NOT NULL AND p.data_prevista < CURDATE()
        THEN 'ATRASADO'
        ELSE p.status
      END AS status_efetivo,
      p.tipo,
      COUNT(*) AS quantidade,
      COALESCE(SUM(p.valor), 0) AS total
    FROM provisionamentos p
    ${where}
    GROUP BY status_efetivo, p.tipo
  `;
  const [rows] = await connection.execute(query, params);
  return rows;
};

// Cria um novo provisionamento
const create = async (data, empresaId) => {
  const {
    vinculo_tipo,
    vinculo_id,
    vinculo_label,
    apartamento_id,
    tipo,
    valor,
    descricao,
    data_prevista,
    data_realizada,
    status,
  } = data;

  ensureAllowedValue(vinculo_tipo, ['forest', 'proprietario', 'fornecedor', 'texto'], 'vinculo_tipo');
  ensureAllowedValue(tipo, ['entrada', 'saida'], 'tipo');

  const dataReal = normalizeDate(data_realizada);
  // Gatilho: se há data realizada, o status é REALIZADO
  let statusFinal = status || 'PREVISTO';
  if (dataReal) statusFinal = 'REALIZADO';
  ensureAllowedValue(statusFinal, ['PREVISTO', 'PENDENTE', 'REALIZADO'], 'status');

  const insertQuery = `
    INSERT INTO provisionamentos (
      empresa_id, vinculo_tipo, vinculo_id, vinculo_label,
      apartamento_id, tipo, valor, descricao,
      data_prevista, data_realizada, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    empresaId,
    vinculo_tipo || 'texto',
    vinculo_tipo === 'proprietario' ? (vinculo_id || null) : null,
    vinculo_label || null,
    apartamento_id || null,
    tipo,
    valor != null ? valor : 0,
    descricao || null,
    normalizeDate(data_prevista),
    dataReal,
    statusFinal,
  ];
  const [result] = await connection.execute(insertQuery, values);
  return { insertId: result.insertId };
};

// Atualiza um provisionamento (parcial), respeitando o isolamento por empresa
const update = async (id, data, empresaId) => {
  if ('id' in data) delete data.id;
  if ('empresa_id' in data) delete data.empresa_id;
  if ('created_at' in data) delete data.created_at;

  // Normaliza datas quando presentes
  if (data.data_prevista !== undefined) data.data_prevista = normalizeDate(data.data_prevista);
  if (data.data_realizada !== undefined) data.data_realizada = normalizeDate(data.data_realizada);

  // Gatilho: ao preencher data_realizada, força status REALIZADO
  if (data.data_realizada) {
    data.status = 'REALIZADO';
  }

  // Validações de enum quando presentes
  if (data.vinculo_tipo !== undefined) {
    ensureAllowedValue(data.vinculo_tipo, ['forest', 'proprietario', 'fornecedor', 'texto'], 'vinculo_tipo');
    // Zera vinculo_id se não for proprietário
    if (data.vinculo_tipo !== 'proprietario') data.vinculo_id = null;
  }
  if (data.tipo !== undefined) ensureAllowedValue(data.tipo, ['entrada', 'saida'], 'tipo');
  if (data.status !== undefined) ensureAllowedValue(data.status, ['PREVISTO', 'PENDENTE', 'REALIZADO'], 'status');

  data.updated_at = new Date();

  const fields = [];
  const values = [];
  for (const [key, val] of Object.entries(data)) {
    fields.push(`\`${key}\` = ?`);
    values.push(val);
  }
  if (!fields.length) return { message: 'Nada para atualizar.' };

  const sql = `UPDATE provisionamentos SET ${fields.join(', ')} WHERE id = ? AND empresa_id = ?`;
  values.push(id, empresaId);
  const [result] = await connection.execute(sql, values);
  return { affectedRows: result.affectedRows, message: 'Provisionamento atualizado com sucesso.' };
};

// Remove um provisionamento (isolado por empresa)
const remove = async (id, empresaId) => {
  const [result] = await connection.execute(
    'DELETE FROM provisionamentos WHERE id = ? AND empresa_id = ?',
    [id, empresaId]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  getResumo,
  create,
  update,
  remove,
};
