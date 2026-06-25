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

// Lista os vínculos apartamento-empresa visíveis para a empresa logada.
// Para cada apartamento vinculado à empresa atual, retorna TODAS as empresas
// vinculadas a ele — assim apartamentos compartilhados entre empresas trazem
// o conjunto completo de empresas que atuam neles.
const getVinculosVisiveis = async (empresaId) => {
  const query = `
    SELECT ae.apartamento_id, ae.empresa_id, e.nome AS empresa_nome
    FROM apartamento_empresa ae
    INNER JOIN empresas e ON e.id = ae.empresa_id
    WHERE ae.is_active = 1
      AND EXISTS (
        SELECT 1 FROM apartamento_empresa ae2
        WHERE ae2.apartamento_id = ae.apartamento_id
          AND ae2.empresa_id = ?
          AND ae2.is_active = 1
      )
  `;
  const [rows] = await connection.execute(query, [empresaId]);
  return rows;
};

// Lista os terceirizados de todas as empresas que compartilham apartamentos
// com a empresa logada (incluindo a própria empresa). Usado na escala de
// faxina para permitir atribuir limpadores das empresas vinculadas ao apto.
const getTerceirizadosVisiveis = async (empresaId) => {
  const query = `
    SELECT u.id, u.first_name, u.last_name, u.role, u.empresa_id, e.nome AS empresa_nome
    FROM users u
    INNER JOIN empresas e ON e.id = u.empresa_id
    WHERE u.role = 'terceirizado'
      AND u.empresa_id IN (
        SELECT DISTINCT ae.empresa_id
        FROM apartamento_empresa ae
        WHERE ae.is_active = 1
          AND EXISTS (
            SELECT 1 FROM apartamento_empresa ae2
            WHERE ae2.apartamento_id = ae.apartamento_id
              AND ae2.empresa_id = ?
              AND ae2.is_active = 1
          )
      )
    ORDER BY e.nome, u.first_name
  `;
  const [rows] = await connection.execute(query, [empresaId]);
  return rows;
};

module.exports = {
  vincularEmpresa,
  desvincularEmpresa,
  getEmpresasByApartamento,
  getVinculosVisiveis,
  getTerceirizadosVisiveis
};
