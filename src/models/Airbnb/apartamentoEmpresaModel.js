const connection = require('../connection2');

// Adiciona vínculo entre apartamento e empresa (idempotente)
const vincularEmpresa = async (apartamento_id, empresa_id) => {
  const query = `
    INSERT INTO apartamento_empresa (apartamento_id, empresa_id, is_active)
    VALUES (?, ?, 1)
    ON DUPLICATE KEY UPDATE is_active = 1
  `;
  await connection.execute(query, [apartamento_id, empresa_id]);
  return true;
};

// Remove vínculo entre apartamento e empresa
const desvincularEmpresa = async (apartamento_id, empresa_id) => {
  const query = `DELETE FROM apartamento_empresa WHERE apartamento_id = ? AND empresa_id = ?`;
  const [result] = await connection.execute(query, [apartamento_id, empresa_id]);
  return result.affectedRows > 0;
};

// Lista as empresas vinculadas a um apartamento
const getEmpresasByApartamento = async (apartamento_id) => {
  const query = `
    SELECT e.*
    FROM empresas e
    INNER JOIN apartamento_empresa ae ON e.id = ae.empresa_id
    WHERE ae.apartamento_id = ? AND ae.is_active = 1
  `;
  const [rows] = await connection.execute(query, [apartamento_id]);
  return rows;
};

module.exports = {
  vincularEmpresa,
  desvincularEmpresa,
  getEmpresasByApartamento
};
