const connection = require('../connection2');

// Lista as empresas ativas (id e nome) — usado para seleção de empresa no cadastro de usuários
const getAllEmpresas = async () => {
  const query = `
    SELECT id, nome
    FROM empresas
    WHERE status = 'ativa'
    ORDER BY nome
  `;
  const [rows] = await connection.execute(query);
  return rows;
};

module.exports = {
  getAllEmpresas
};
