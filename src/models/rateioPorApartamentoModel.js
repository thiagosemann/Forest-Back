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
    (apartamento_id, rateio_id, valor, apt_name, apt_fracao, valorIndividual, valorComum, valorProvisoes, valorFundos, fracao_vagas, fracao_total, data_pagamento) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    "", // Valor padrão para data_pagamento
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

const updateDataPagamento = async (id, dataPagamento) => {
  const query = `
    UPDATE rateio_por_apartamento
    SET data_pagamento = ?
    WHERE id = ?
  `;

  try {
    const [result] = await connection.execute(query, [dataPagamento, id]);
    return result.affectedRows > 0; // Retorna true se a atualização foi bem-sucedida
  } catch (error) {
    console.error('Erro ao atualizar data_pagamento:', error);
    throw error;
  }
};

const getRateiosNaoPagosPorPredioId = async (predioId) => {
  const query = `
    SELECT rpa.*, 
           CONCAT(LPAD(r.mes, 2, '0'), '/', r.ano) AS data_vencimento
    FROM rateio_por_apartamento rpa
    JOIN apartamentos apt ON rpa.apartamento_id = apt.id
    JOIN rateios r ON rpa.rateio_id = r.id
    WHERE apt.predio_id = ?
      AND (rpa.data_pagamento IS NULL OR rpa.data_pagamento = '')
  `;

  try {
    const [rateios] = await connection.execute(query, [predioId]);
    return rateios; // Retorna todos os rateios encontrados com a propriedade 'data_vencimento'
  } catch (error) {
    console.error('Erro ao buscar rateios por predio_id:', error);
    throw error;
  }
};

const atualizarDataPagamento = async (pagamentosConsolidados) => {
  // Função para normalizar o valor (remover "R$", substituir vírgula por ponto e arredondar)
  const normalizarValor = (valor) => {
    const valorNumerico = parseFloat(valor.replace('R$', '').replace(',', '.').trim());
    return Math.floor(valorNumerico); // Arredonda para baixo, ignorando centavos
  };

  try {
    // Iterar sobre cada pagamento consolidado
    for (const pagamento of pagamentosConsolidados) {
      const { apt_name, data_vencimento, valor } = pagamento;

      // Normalizar o valor do pagamento consolidado
      const valorConsolidadoNormalizado = normalizarValor(valor);

      // Consultar rateio_por_apartamento para encontrar registros com o mesmo apt_name
      const queryRateioPorApartamento = `
        SELECT rpa.*, CONCAT(LPAD(r.mes, 2, '0'), '/', r.ano) AS data_rateio
        FROM rateio_por_apartamento rpa
        JOIN rateios r ON rpa.rateio_id = r.id
        WHERE rpa.apt_name = ?
      `;
      const [rateiosPorApartamento] = await connection.execute(queryRateioPorApartamento, [apt_name]);

      // Iterar sobre os registros encontrados
      for (const rateio of rateiosPorApartamento) {
        // Normalizar o valor do rateio
        const valorRateioNormalizado = normalizarValor(rateio.valor);

        // Comparar valores normalizados e datas de vencimento
        if (
          valorRateioNormalizado === valorConsolidadoNormalizado &&
          rateio.data_rateio === data_vencimento
        ) {
          // Atualizar a coluna data_pagamento
          const updateQuery = `
            UPDATE rateio_por_apartamento
            SET data_pagamento = ?
            WHERE id = ?
          `;
          await connection.execute(updateQuery, [data_vencimento, rateio.id]);
          console.log(`Data de pagamento atualizada para o apartamento ${apt_name}: ${data_vencimento}`);
        }
      }
    }

    console.log('Atualização de data_pagamento concluída com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar data_pagamento:', error);
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
  getRateioPorApartamentoByAptId,
  updateDataPagamento,
  getRateiosNaoPagosPorPredioId,
  atualizarDataPagamento
};
