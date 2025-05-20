// src/models/Airbnb/vistoriaModel.js

const connection = require('../connection2');

// 1) Lista todas as vistorias (já com colunas de itens)
const getAllVistorias = async () => {
  const [rows] = await connection.execute(`
    SELECT 
      v.*,
      a.nome AS apartamento_nome,
      u.first_name AS usuario_nome    
    FROM vistoria v
    LEFT JOIN apartamentos a ON v.apartamento_id = a.id
    LEFT JOIN users u       ON v.user_id       = u.id
  `);
  return rows;
};

// 2) Busca vistoria por ID
const getVistoriaById = async (id) => {
  const [rows] = await connection.execute(
    `SELECT * FROM vistoria WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// 3) Cria uma nova vistoria COM todos os campos de itens
const createVistoria = async (dataObj) => {
  const { apartamento_id, user_id, data } = dataObj;
  if (!apartamento_id || !user_id || !data) {
    throw new Error("Campos 'apartamento_id', 'user_id' e 'data' são obrigatórios.");
  }

  const cols = Object.keys(dataObj).join(', ');
  const placeholders = Object.keys(dataObj).map(() => '?').join(', ');
  const values = Object.values(dataObj);

  const query = `INSERT INTO vistoria (${cols}) VALUES (${placeholders})`;
  const [result] = await connection.execute(query, values);
  return { insertId: result.insertId };
};

// 4) Atualiza vistoria existente (todos os campos menos o id)
const updateVistoria = async (dataObj) => {
  const { id, ...fields } = dataObj;
  if (!id) throw new Error("Campo 'id' é obrigatório para update.");

  const setClauses = Object.keys(fields).map(col => `${col} = ?`).join(', ');
  const values = [...Object.values(fields), id];

  const query = `UPDATE vistoria SET ${setClauses} WHERE id = ?`;
  const [result] = await connection.execute(query, values);
  return result.affectedRows > 0;
};

// 5) Deleta vistoria (sem mais tabela de itens separada)
const deleteVistoria = async (id) => {
  const [result] = await connection.execute(
    `DELETE FROM vistoria WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAllVistorias,
  getVistoriaById,
  createVistoria,
  updateVistoria,
  deleteVistoria
};
