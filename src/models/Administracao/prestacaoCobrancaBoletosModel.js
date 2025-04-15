const connection = require('../connection');

// Obtém todos os registros de boletos
const getAllPrestacaoCobrancaBoletos = async () => {
  const [rows] = await connection.execute('SELECT * FROM prestacaoCobrancaBoletos');
  return rows;
};

// Cria um novo registro de boleto
const createPrestacaoCobrancaBoletos = async (boleto) => {
  const { pdf, predio_id, month, year } = boleto;
  const insertQuery = 'INSERT INTO prestacaoCobrancaBoletos (pdf, predio_id, month, year) VALUES (?, ?, ?, ?)';
  const values = [pdf, predio_id, month, year];

  try {
    const [result] = await connection.execute(insertQuery, values);
    return { id: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir boleto:', error);
    throw error;
  }
};

// Obtém um boleto pelo ID
const getPrestacaoCobrancaBoletoById = async (id) => {
  const query = 'SELECT * FROM prestacaoCobrancaBoletos WHERE id = ?';
  const [rows] = await connection.execute(query, [id]);

  if (rows.length > 0) {
    const boleto = rows[0];
    boleto.pdf = boleto.pdf || null;
    return boleto;
  } else {
    console.log('Nenhum boleto encontrado com o ID:', id);
    return null;
  }
};

// Atualiza um boleto existente
const updatePrestacaoCobrancaBoleto = async (boleto) => {
  const { id, pdf, predio_id, month, year } = boleto;
  const updateQuery = `
    UPDATE prestacaoCobrancaBoletos 
    SET pdf = ?, predio_id = ?, month = ?, year = ?
    WHERE id = ?
  `;
  const values = [pdf, predio_id, month, year, id];

  try {
    const [result] = await connection.execute(updateQuery, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar boleto:', error);
    throw error;
  }
};

// Deleta um boleto pelo ID
const deletePrestacaoCobrancaBoleto = async (id) => {
  const deleteQuery = 'DELETE FROM prestacaoCobrancaBoletos WHERE id = ?';
  try {
    const [result] = await connection.execute(deleteQuery, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar boleto:', error);
    throw error;
  }
};

// Obtém boletos filtrados por prédio, mês e ano
const getPrestacaoCobrancaBoletosByBuildingAndMonth = async (predio_id, month, year) => {
  const query = `
    SELECT *
    FROM prestacaoCobrancaBoletos
    WHERE predio_id = ? 
      AND month = ?
      AND year = ?
  `;
  try {
    const [rows] = await connection.execute(query, [predio_id, month, year]);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar boletos por prédio, mês e ano:', error);
    throw error;
  }
};

module.exports = {
  getAllPrestacaoCobrancaBoletos,
  createPrestacaoCobrancaBoletos,
  getPrestacaoCobrancaBoletoById,
  updatePrestacaoCobrancaBoleto,
  deletePrestacaoCobrancaBoleto,
  getPrestacaoCobrancaBoletosByBuildingAndMonth
};
