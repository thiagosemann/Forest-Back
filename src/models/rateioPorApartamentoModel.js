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
const getRateioPorApartamentoByAptId = async (apartamentoId) => {
  // Primeiro, buscar os valores e rateio_id da tabela rateio_por_apartamento
  const queryRateioPorApartamento = `
    SELECT valor, rateio_id 
    FROM rateio_por_apartamento 
    WHERE apartamento_id = ?
  `;
  const [rateioPorApartamento] = await connection.execute(queryRateioPorApartamento, [apartamentoId]);

  if (rateioPorApartamento.length === 0) {
    return []; // Retorna um array vazio se não houver registros
  }

  // Obter os rateio_id e buscar os dados correspondentes na tabela rateios
  const rateioIds = rateioPorApartamento.map(item => item.rateio_id);
  const placeholders = rateioIds.map(() => '?').join(','); // Para criar placeholders dinâmicos
  const queryRateios = `
    SELECT id AS rateio_id, mes, ano 
    FROM rateios 
    WHERE id IN (${placeholders})
  `;
  const [rateios] = await connection.execute(queryRateios, rateioIds);

  // Montar o array de objetos combinando os dados das duas tabelas
  const result = rateioPorApartamento.map(item => {
    const rateio = rateios.find(r => r.rateio_id === item.rateio_id);
    return {
      valor: item.valor,
      mes: rateio?.mes || null, // Garantir segurança caso não encontre
      ano: rateio?.ano || null,
    };
  });

  return result;
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
  getRateioPorApartamentoByAptId
};
