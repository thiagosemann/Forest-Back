const connection = require('../connection2');

// Lista todos os NPS, com joins e filtro opcional por empresa
const getAllNps = async (empresaId) => {
  let query = `
    SELECT 
      n.id,
      n.user_id,
      n.empresa_id,
      n.apartamento_id,
      n.nota_geral,
      n.comentario,
      n.limpeza_quarto,
      n.limpeza_banheiros,
      n.limpeza_cozinha,
      n.created_at,
      a.nome AS apartamento_nome,
      CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS terceirizado_nome
    FROM nps_limpezas n
    LEFT JOIN apartamentos a ON a.id = n.apartamento_id
    LEFT JOIN users u ON u.id = n.user_id`;
  const params = [];
  if (empresaId) {
    query += ' WHERE n.empresa_id = ?';
    params.push(empresaId);
  }
  query += ' ORDER BY n.created_at DESC, n.id DESC';
  const [rows] = await connection.execute(query, params);
  return rows;
};

// Busca NPS por ID (com filtro opcional de empresa)
const getNpsById = async (id, empresaId) => {
  let query = `
    SELECT 
      n.id,
      n.user_id,
      n.empresa_id,
      n.apartamento_id,
      n.nota_geral,
      n.comentario,
      n.limpeza_quarto,
      n.limpeza_banheiros,
      n.limpeza_cozinha,
      n.created_at,
      a.nome AS apartamento_nome,
      CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS terceirizado_nome
    FROM nps_limpezas n
    LEFT JOIN apartamentos a ON a.id = n.apartamento_id
    LEFT JOIN users u ON u.id = n.user_id
    WHERE n.id = ?`;
  const params = [id];
  if (empresaId) {
    query += ' AND n.empresa_id = ?';
    params.push(empresaId);
  }
  const [rows] = await connection.execute(query, params);
  return rows[0] || null;
};

// Helper interno: versão "raw" sem joins
const getNpsRawById = async (id) => {
  const [rows] = await connection.execute(
    `SELECT id, user_id, empresa_id, apartamento_id, nota_geral, comentario, limpeza_quarto, limpeza_banheiros, limpeza_cozinha, created_at FROM nps_limpezas WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Lista por apartamento
const getNpsByApartamentoId = async (apartamentoId, empresaId) => {
  let query = `
    SELECT 
      n.id,
      n.user_id,
      n.empresa_id,
      n.apartamento_id,
      n.nota_geral,
      n.comentario,
      n.limpeza_quarto,
      n.limpeza_banheiros,
      n.limpeza_cozinha,
      n.created_at,
      a.nome AS apartamento_nome,
      CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS terceirizado_nome
    FROM nps_limpezas n
    LEFT JOIN apartamentos a ON a.id = n.apartamento_id
    LEFT JOIN users u ON u.id = n.user_id
    WHERE n.apartamento_id = ?`;
  const params = [apartamentoId];
  if (empresaId) {
    query += ' AND n.empresa_id = ?';
    params.push(empresaId);
  }
  query += ' ORDER BY n.created_at DESC, n.id DESC';
  const [rows] = await connection.execute(query, params);
  return rows;
};

// Lista por terceirizado (user)
const getNpsByUserId = async (userId, empresaId) => {
  let query = `
    SELECT 
      n.id,
      n.user_id,
      n.empresa_id,
      n.apartamento_id,
      n.nota_geral,
      n.comentario,
      n.limpeza_quarto,
      n.limpeza_banheiros,
      n.limpeza_cozinha,
      n.created_at,
      a.nome AS apartamento_nome,
      CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS terceirizado_nome
    FROM nps_limpezas n
    LEFT JOIN apartamentos a ON a.id = n.apartamento_id
    LEFT JOIN users u ON u.id = n.user_id
    WHERE n.user_id IS NOT NULL AND n.user_id = ?`;
  const params = [userId];
  if (empresaId) {
    query += ' AND n.empresa_id = ?';
    params.push(empresaId);
  }
  query += ' ORDER BY n.created_at DESC, n.id DESC';
  const [rows] = await connection.execute(query, params);
  return rows;
};

// Cria um novo registro de NPS
const createNps = async (data) => {
  const {
    user_id = null,
    empresa_id,
    apartamento_id,
    nota_geral,
    comentario = null,
    limpeza_quarto = null,
    limpeza_banheiros = null,
    limpeza_cozinha = null,
  } = data || {};

  const nota = Number(nota_geral);
  if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
    throw new Error('nota_geral inválida. Deve ser um número entre 0 e 10.');
  }
  if (!empresa_id) throw new Error('empresa_id é obrigatório.');
  if (!apartamento_id) throw new Error('apartamento_id é obrigatório.');

  const insertQuery = `
    INSERT INTO nps_limpezas
      (user_id, empresa_id, apartamento_id, nota_geral, comentario, limpeza_quarto, limpeza_banheiros, limpeza_cozinha)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    user_id ?? null,
    empresa_id,
    apartamento_id,
    nota,
    comentario ?? null,
    limpeza_quarto ?? null,
    limpeza_banheiros ?? null,
    limpeza_cozinha ?? null,
  ];

  try {
    const [result] = await connection.execute(insertQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir NPS:', error);
    throw error;
  }
};

// Atualiza um NPS existente
const updateNps = async (id, data) => {
  const existing = await getNpsRawById(id);
  if (!existing) throw new Error('NPS não encontrado.');

  const merged = { ...existing, ...(data || {}) };
  const {
    user_id,
    empresa_id,
    apartamento_id,
    nota_geral,
    comentario,
    limpeza_quarto,
    limpeza_banheiros,
    limpeza_cozinha,
  } = merged;

  const nota = Number(nota_geral);
  if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
    throw new Error('nota_geral inválida. Deve ser um número entre 0 e 10.');
  }

  const updateQuery = `
    UPDATE nps_limpezas SET
      user_id = ?,
      empresa_id = ?,
      apartamento_id = ?,
      nota_geral = ?,
      comentario = ?,
      limpeza_quarto = ?,
      limpeza_banheiros = ?,
      limpeza_cozinha = ?
    WHERE id = ?
  `;
  const values = [
    (user_id ?? null),
    empresa_id,
    apartamento_id,
    nota,
    (comentario ?? null),
    (limpeza_quarto ?? null),
    (limpeza_banheiros ?? null),
    (limpeza_cozinha ?? null),
    id,
  ];

  try {
    const [result] = await connection.execute(updateQuery, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar NPS:', error);
    throw error;
  }
};

// Exclui um registro de NPS
const deleteNps = async (id) => {
  try {
    const [result] = await connection.execute('DELETE FROM nps_limpezas WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar NPS:', error);
    throw error;
  }
};

module.exports = {
  getAllNps,
  getNpsById,
  getNpsByApartamentoId,
  getNpsByUserId,
  createNps,
  updateNps,
  deleteNps,
};
