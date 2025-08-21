const connection = require('../connection2');

// Buscar todos os vínculos NodeMCU-Prédio
const getAllNodemcuPredios = async () => {
  const [rows] = await connection.execute(
    `SELECT np.*, p.nome AS predio_nome 
     FROM nodemcu_predio np
     JOIN predios p ON np.predio_id = p.id`
  );
  return rows;
};

// Buscar vínculo por ID
const getNodemcuPredioById = async (id) => {
  const [rows] = await connection.execute(
    'SELECT * FROM nodemcu_predio WHERE id = ?', [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Buscar vínculo por idNodemcu
const getNodemcuPredioByNodemcu = async (idNodemcu) => {
  const [rows] = await connection.execute(
    'SELECT * FROM nodemcu_predio WHERE idNodemcu = ?', [idNodemcu]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Buscar todos os NodeMCUs vinculados a um prédio
const getNodesByPredioID = async (predio_id) => {
  const [rows] = await connection.execute(
    'SELECT * FROM nodemcu_predio WHERE predio_id = ?', [predio_id]
  );
  return rows;
};

// Criar novo vínculo NodeMCU-Prédio
const createNodemcuPredio = async ({ predio_id, idNodemcu }) => {
  const insertQuery = `
    INSERT INTO nodemcu_predio (predio_id, idNodemcu)
    VALUES (?, ?)
  `;
  try {
    const [result] = await connection.execute(insertQuery, [predio_id, idNodemcu]);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir vínculo NodeMCU-Prédio:', error);
    throw error;
  }
};

// Atualizar vínculo NodeMCU-Prédio
const updateNodemcuPredio = async ({ id, predio_id, idNodemcu }) => {
  const updateQuery = `
    UPDATE nodemcu_predio SET
      predio_id = ?,
      idNodemcu = ?
    WHERE id = ?
  `;
  try {
    const [result] = await connection.execute(updateQuery, [predio_id, idNodemcu, id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar vínculo NodeMCU-Prédio:', error);
    throw error;
  }
};

// Deletar vínculo por ID
const deleteNodemcuPredio = async (id) => {
  try {
    const [result] = await connection.execute(
      'DELETE FROM nodemcu_predio WHERE id = ?', [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar vínculo NodeMCU-Prédio:', error);
    throw error;
  }
};

module.exports = {
  getAllNodemcuPredios,
  getNodemcuPredioById,
  getNodemcuPredioByNodemcu,
  getNodesByPredioID,
  createNodemcuPredio,
  updateNodemcuPredio,
  deleteNodemcuPredio,
};