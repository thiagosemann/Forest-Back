const connection = require('../connection2');

// Helper to fetch files for a reimbursement ticket
const getReembolsoFiles = async (reembolsoId) => {
  const [rows] = await connection.execute(
    'SELECT id, imagemBase64, type, created_at, file_name FROM ticket_reembolso_arquivos WHERE reembolso_id = ?',
    [reembolsoId]
  );
  return rows;
};

// Fetch all reimbursement tickets with optional join of files count and apartment name
const getAllReembolsos = async (empresaId) => {
  let query = `SELECT tr.*, COUNT(f.id) AS file_count, a.nome AS apartamento_nome, a.is_active AS apartamento_ativo
     FROM ticket_reembolso tr
     LEFT JOIN ticket_reembolso_arquivos f ON tr.id = f.reembolso_id
     LEFT JOIN apartamentos a ON tr.apartamento_id = a.id`;
  let params = [];
  if (empresaId) {
    query += ' WHERE EXISTS (SELECT 1 FROM apartamento_empresa ae WHERE ae.apartamento_id = a.id AND ae.empresa_id = ?)';
    params.push(empresaId);
  }
  query += ' GROUP BY tr.id';
  const [rows] = await connection.execute(query, params);
  return rows;
};

// Fetch a single reimbursement ticket by id, including files and apartment name
const getReembolsoById = async (id, empresaId) => {
  let query = `SELECT tr.*, a.nome AS apartamento_nome, a.is_active AS apartamento_ativo
     FROM ticket_reembolso tr
     LEFT JOIN apartamentos a ON tr.apartamento_id = a.id
     WHERE tr.id = ?`;
  let params = [id];
  if (empresaId) {
    query += ' AND EXISTS (SELECT 1 FROM apartamento_empresa ae WHERE ae.apartamento_id = a.id AND ae.empresa_id = ?)';
    params.push(empresaId);
  }
  const [tickets] = await connection.execute(query, params);
  if (!tickets.length) return null;
  const ticket = tickets[0];
  ticket.files = await getReembolsoFiles(id);
  return ticket;
};

// Monta o WHERE do resumo: empresa (via apartamento_empresa), status e período (created_at)
const buildResumoWhere = (empresaId, filtros) => {
  const clauses = ['EXISTS (SELECT 1 FROM apartamento_empresa ae WHERE ae.apartamento_id = a.id AND ae.empresa_id = ?)'];
  const params = [empresaId];

  if (filtros.status && filtros.status.length) {
    clauses.push(`tr.status IN (${filtros.status.map(() => '?').join(',')})`);
    params.push(...filtros.status);
  }
  if (filtros.periodo === '15d') {
    clauses.push('tr.created_at >= DATE_SUB(CURDATE(), INTERVAL 15 DAY)');
  } else if (filtros.periodo === '30d') {
    clauses.push('tr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)');
  } else if (filtros.periodo === 'mes' && filtros.mes) {
    clauses.push("DATE_FORMAT(tr.created_at, '%Y-%m') = ?");
    params.push(filtros.mes);
  }
  return { where: `WHERE ${clauses.join(' AND ')}`, params };
};

// Resumo agregado de reembolsos por apartamento ou por proprietário, para o fechamento mensal
const getResumo = async (empresaId, filtros = {}) => {
  const { where, params } = buildResumoWhere(empresaId, filtros);
  const valorExpr = 'COALESCE(SUM(COALESCE(tr.valor_material,0) + COALESCE(tr.valor_mao_obra,0)), 0)';

  const query = filtros.agrupamento === 'proprietario'
    ? `SELECT u.id AS proprietario_id,
              NULLIF(TRIM(CONCAT(COALESCE(u.first_name,''), ' ', COALESCE(u.last_name,''))), '') AS proprietario_nome,
              a.id AS apartamento_id, a.nome AS apartamento_nome,
              tr.status, COUNT(*) AS quantidade, ${valorExpr} AS total
       FROM ticket_reembolso tr
       LEFT JOIN apartamentos a ON tr.apartamento_id = a.id
       LEFT JOIN apartamento_proprietario ap ON ap.apartamento_id = a.id
       LEFT JOIN users u ON u.id = ap.user_id
       ${where}
       GROUP BY u.id, proprietario_nome, a.id, a.nome, tr.status
       ORDER BY proprietario_nome IS NULL, proprietario_nome, a.nome`
    : `SELECT a.id AS apartamento_id, a.nome AS apartamento_nome,
              tr.status, COUNT(*) AS quantidade, ${valorExpr} AS total
       FROM ticket_reembolso tr
       LEFT JOIN apartamentos a ON tr.apartamento_id = a.id
       ${where}
       GROUP BY a.id, a.nome, tr.status
       ORDER BY a.nome`;

  const [rows] = await connection.execute(query, params);
  return rows;
};

// Primeiro mês (YYYY-MM) com ticket de reembolso registrado para a empresa
const getPeriodoDisponivel = async (empresaId) => {
  const query = `SELECT MIN(tr.created_at) AS primeira_data
     FROM ticket_reembolso tr
     LEFT JOIN apartamentos a ON tr.apartamento_id = a.id
     WHERE EXISTS (SELECT 1 FROM apartamento_empresa ae WHERE ae.apartamento_id = a.id AND ae.empresa_id = ?)`;
  const [rows] = await connection.execute(query, [empresaId]);
  const primeiraData = rows[0]?.primeira_data;
  return { primeiroMes: primeiraData ? new Date(primeiraData).toISOString().slice(0, 7) : null };
};

// Create a new reimbursement ticket and optional files
const createReembolso = async (data, arquivos = []) => {
  const {
    apartamento_id,
    user_id,
    item_problema,
    descricao_problema,
    solucao,
    status,
    notificado_forest,
    data_notificacao,
    valor_material,
    valor_mao_obra,
    data_realizado,
    pagamento_confirmado,
    data_pagamento,
    auth,
    link_pagamento
  } = data;

  const insertTicketQuery = `
    INSERT INTO ticket_reembolso (
      apartamento_id,
      user_id,
      item_problema,
      descricao_problema,
      solucao,
      status,
      notificado_forest,
      data_notificacao,
      valor_material,
      valor_mao_obra,
      data_realizado,
      pagamento_confirmado,
      data_pagamento,
      auth,
      link_pagamento
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const ticketValues = [
    apartamento_id,
    user_id || null,
    item_problema,
    descricao_problema,
    solucao,
    status || 'PENDENTE',
    notificado_forest || 0,
    data_notificacao || null,
    valor_material || null,
    valor_mao_obra || null,
    data_realizado || null,
    pagamento_confirmado || 0,
    data_pagamento || null,
    auth || null,
    link_pagamento || null
  ];

  const [result] = await connection.execute(insertTicketQuery, ticketValues);
  const reembolsoId = result.insertId;

  // Insert files if provided
  if (arquivos.length) {
    const insertFileQuery = `
      INSERT INTO ticket_reembolso_arquivos (
        reembolso_id,
        imagemBase64,
        type,
        file_name
      ) VALUES ?
    `;
    const fileValues = arquivos.map(f => [
      reembolsoId,
      f.imagemBase64,
      f.type,
      f.file_name || null
    ]);
    await connection.query(insertFileQuery, [fileValues]);
  }

  return { insertId: reembolsoId };
};

// Update reimbursement ticket and manage files (replace existing if provided)
const updateReembolso = async (id, data, arquivos) => {
  // Atualiza datas automáticas conforme status
  if (data.status === 'REALIZADO') {
    data.data_realizado = new Date();
  }
  if (data.status === 'PAGO') {
    data.data_pagamento = new Date();
  }
  // Sempre atualiza updated_at
  data.updated_at = new Date();

  // Update main ticket data
  const fields = [];
  const values = [];
  for (const [key, val] of Object.entries(data)) {
    if (key === 'created_at') continue; // não permitir atualização de created_at vinda do cliente
    fields.push(`\`${key}\` = ?`);
    values.push(val);
  }
  if (fields.length) {
    const updateQuery = `UPDATE ticket_reembolso SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    await connection.execute(updateQuery, values);
  }

  // If arquivos provided, delete old and insert new
  if (Array.isArray(arquivos)) {
    await connection.execute(
      'DELETE FROM ticket_reembolso_arquivos WHERE reembolso_id = ?',
      [id]
    );
    if (arquivos.length) {
      const insertFileQuery = `
        INSERT INTO ticket_reembolso_arquivos (
          reembolso_id,
          imagemBase64,
          type
        ) VALUES ?
      `;
      const fileValues = arquivos.map(f => [id, f.imagemBase64, f.type]);
      await connection.query(insertFileQuery, [fileValues]);
    }
  }

  return { message: 'Reembolso atualizado com sucesso.' };
};

// Delete a reimbursement ticket and its files
const deleteReembolso = async (id) => {
  await connection.execute(
    'DELETE FROM ticket_reembolso_arquivos WHERE reembolso_id = ?',
    [id]
  );
  const [result] = await connection.execute(
    'DELETE FROM ticket_reembolso WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

// Buscar ticket por auth, incluindo nome do apartamento
const getTicketByAuth = async (auth, empresaId) => {
  let query = `SELECT tr.*, a.nome AS apartamento_nome, a.is_active AS apartamento_ativo
     FROM ticket_reembolso tr
     LEFT JOIN apartamentos a ON tr.apartamento_id = a.id
     WHERE tr.auth = ?`;
  let params = [auth];
  if (empresaId) {
    query += ' AND EXISTS (SELECT 1 FROM apartamento_empresa ae WHERE ae.apartamento_id = a.id AND ae.empresa_id = ?)';
    params.push(empresaId);
  }
  const [tickets] = await connection.execute(query, params);
  if (!tickets.length) return null;
  const ticket = tickets[0];
  ticket.files = await getReembolsoFiles(ticket.id);
  return ticket;
};

// Criar arquivo para ticket de reembolso
const createArquivoReembolso = async (reembolso_id, imagemBase64, type, file_name) => {
  const insertFileQuery = `
    INSERT INTO ticket_reembolso_arquivos (
      reembolso_id,
      imagemBase64,
      type,
      file_name
    ) VALUES (?, ?, ?, ?)
  `;
  const [result] = await connection.execute(insertFileQuery, [reembolso_id, imagemBase64, type, file_name]);
  return { insertId: result.insertId };
};

// Atualizar arquivo de ticket de reembolso
const updateArquivoReembolso = async (id, fields) => {
  const setFields = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    setFields.push(`\`${key}\` = ?`);
    values.push(value);
  }
  if (!setFields.length) return { message: 'Nada para atualizar.' };
  const updateQuery = `UPDATE ticket_reembolso_arquivos SET ${setFields.join(', ')} WHERE id = ?`;
  values.push(id);
  await connection.execute(updateQuery, values);
  return { message: 'Arquivo atualizado com sucesso.' };
};

// Deletar arquivo de ticket de reembolso
const deleteArquivoReembolso = async (id) => {
  const [result] = await connection.execute(
    'DELETE FROM ticket_reembolso_arquivos WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getReembolsoFiles,
  getAllReembolsos,
  getResumo,
  getPeriodoDisponivel,
  getReembolsoById,
  createReembolso,
  updateReembolso,
  deleteReembolso,
  getTicketByAuth,
  createArquivoReembolso,
  updateArquivoReembolso,
  deleteArquivoReembolso,
};
