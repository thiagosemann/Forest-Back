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
const getAllReembolsos = async () => {
  const [rows] = await connection.execute(
    `SELECT tr.*, COUNT(f.id) AS file_count, a.nome AS apartamento_nome
     FROM ticket_reembolso tr
     LEFT JOIN ticket_reembolso_arquivos f ON tr.id = f.reembolso_id
     LEFT JOIN apartamentos a ON tr.apartamento_id = a.id
     GROUP BY tr.id`
  );
  return rows;
};

// Fetch a single reimbursement ticket by id, including files and apartment name
const getReembolsoById = async (id) => {
  const [tickets] = await connection.execute(
    `SELECT tr.*, a.nome AS apartamento_nome
     FROM ticket_reembolso tr
     LEFT JOIN apartamentos a ON tr.apartamento_id = a.id
     WHERE tr.id = ?`,
    [id]
  );
  if (!tickets.length) return null;
  const ticket = tickets[0];
  ticket.files = await getReembolsoFiles(id);
  return ticket;
};

// Create a new reimbursement ticket and optional files
const createReembolso = async (data, arquivos = []) => {
  const {
    apartamento_id,
    item_problema,
    descricao_problema,
    solucao,
    status,
    notificado_forest,
    data_notificacao,
    valor_material,
    valor_mao_obra,
    data_realizado, // nova coluna
    pagamento_confirmado,
    data_pagamento,
    auth, // nova coluna
    link_pagamento // nova coluna
  } = data;

  const insertTicketQuery = `
    INSERT INTO ticket_reembolso (
      apartamento_id,
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const ticketValues = [
    apartamento_id,
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
const getTicketByAuth = async (auth) => {
  const [tickets] = await connection.execute(
    `SELECT tr.*, a.nome AS apartamento_nome
     FROM ticket_reembolso tr
     LEFT JOIN apartamentos a ON tr.apartamento_id = a.id
     WHERE tr.auth = ?`,
    [auth]
  );
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
  getReembolsoById,
  createReembolso,
  updateReembolso,
  deleteReembolso,
  getTicketByAuth,
  createArquivoReembolso,
  updateArquivoReembolso,
  deleteArquivoReembolso,
};
