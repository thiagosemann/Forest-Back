const connection = require('./connection');

const getAllRateiosPorApartamento = async () => {
  const [rateios] = await connection.execute('SELECT * FROM rateio_por_apartamento');
  return rateios;
};

const createRateioPorApartamento = async (rateioPorApartamento) => {
  const {
    apartamento_id,
    rateio_id,
    valor,
    apt_name,
    apt_fracao,
    valorIndividual,
    valorComum,
    valorProvisoes,
    valorFundos,
    fracao_vagas,
    fracao_total,
  } = rateioPorApartamento;

  const insertRateioQuery = `
    INSERT INTO rateio_por_apartamento 
    (apartamento_id, rateio_id, valor, apt_name, apt_fracao, valorIndividual, valorComum, valorProvisoes, valorFundos, fracao_vagas, fracao_total) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    apartamento_id,
    rateio_id,
    valor,
    apt_name,
    apt_fracao,
    valorIndividual,
    valorComum,
    valorProvisoes,
    valorFundos,
    fracao_vagas,
    fracao_total,
  ];

  try {
    const [result] = await connection.execute(insertRateioQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir rateio por apartamento:', error);
    throw error;
  }
};

const getRateioPorApartamentoById = async (id) => {
  const query = 'SELECT * FROM rateio_por_apartamento WHERE id = ?';
  const [rateios] = await connection.execute(query, [id]);

  return rateios.length > 0 ? rateios[0] : null;
};

const getRateiosPorRateioId = async (rateioId) => {
  const query = 'SELECT * FROM rateio_por_apartamento WHERE rateio_id = ?';
  const [rateios] = await connection.execute(query, [rateioId]);
  return rateios;
};

const updateRateioPorApartamento = async (rateioPorApartamento) => {
  const {
    id,
    apartamento_id,
    rateio_id,
    valor,
    apt_name,
    apt_fracao,
    valorIndividual,
    valorComum,
    valorProvisoes,
    valorFundos,
    fracao_vagas,
    fracao_total,
  } = rateioPorApartamento;

  const updateRateioQuery = `
    UPDATE rateio_por_apartamento
    SET 
      apartamento_id = ?, 
      rateio_id = ?, 
      valor = ?, 
      apt_name = ?, 
      apt_fracao = ?, 
      valorIndividual = ?, 
      valorComum = ?, 
      valorProvisoes = ?, 
      valorFundos = ?, 
      fracao_vagas = ?, 
      fracao_total = ?
    WHERE id = ?
  `;
  const values = [
    apartamento_id,
    rateio_id,
    valor,
    apt_name,
    apt_fracao,
    valorIndividual,
    valorComum,
    valorProvisoes,
    valorFundos,
    fracao_vagas,
    fracao_total,
    id,
  ];

  try {
    const [result] = await connection.execute(updateRateioQuery, values);
    return result.affectedRows > 0; // Retorna true se o rateio foi atualizado com sucesso
  } catch (error) {
    console.error('Erro ao atualizar rateio por apartamento:', error);
    throw error;
  }
};

const deleteRateioPorApartamento = async (id) => {
  const deleteRateioQuery = 'DELETE FROM rateio_por_apartamento WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteRateioQuery, [id]);
    return result.affectedRows > 0; // Retorna true se o rateio foi deletado com sucesso
  } catch (error) {
    console.error('Erro ao deletar rateio por apartamento:', error);
    throw error;
  }
};

module.exports = {
  getAllRateiosPorApartamento,
  createRateioPorApartamento,
  getRateioPorApartamentoById,
  getRateiosPorRateioId,
  updateRateioPorApartamento,
  deleteRateioPorApartamento,
};
