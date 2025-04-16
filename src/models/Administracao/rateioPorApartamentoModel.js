const connection = require('../connection');

const getAllRateiosPorApartamento = async () => {
  const [rateios] = await connection.execute('SELECT * FROM rateio_por_apartamento');
  return rateios;
};

const createRateioPorApartamento = async (rateioPorApartamento) => {
  const {
    apartamento_id,
    rateio_id,
    rateio_boleto_email_id, // Nova coluna
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
    (apartamento_id, rateio_id, rateio_boleto_email_id, valor, apt_name, apt_fracao, 
     valorIndividual, valorComum, valorProvisoes, valorFundos, fracao_vagas, fracao_total, data_pagamento) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    apartamento_id,
    rateio_id,
    rateio_boleto_email_id || null, // Tratamento do novo campo
    valor,
    apt_name,
    apt_fracao,
    valorIndividual,
    valorComum,
    valorProvisoes,
    valorFundos,
    fracao_vagas,
    fracao_total,
    ""
  ];

  try {
    const [result] = await connection.execute(insertRateioQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir rateio por apartamento:', error);
    throw error;
  }
};

const updateRateioPorApartamento = async (rateioPorApartamento) => {
  const {
    id,
    rateio_boleto_email_id, // Novo campo
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
      rateio_boleto_email_id = ?,  -- Novo campo
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
    rateio_boleto_email_id || null,  // Tratamento do novo campo
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

const updateRateioBoletoEmailId = async (rateioApartamentoId, rateioBoletoEmailId) => {
  const query = `
    UPDATE rateio_por_apartamento
    SET rateio_boleto_email_id = ?
    WHERE id = ?
  `;
  
  try {
    const [result] = await connection.execute(query, [rateioBoletoEmailId, rateioApartamentoId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar vínculo:', error);
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

const getApartamentoByRateioIdEApartamentoId = async (rateioId, apartamentoId) => {
  const query = `
    SELECT * 
    FROM rateio_por_apartamento 
    WHERE rateio_id = ? 
      AND apartamento_id = ?
    LIMIT 1
  `;

  try {
    const [result] = await connection.execute(query, [rateioId, apartamentoId]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Erro ao buscar rateio por apartamento:', error);
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

// Função 1 – Rateios Gerados e Pagos no Mês Correto
const getRateiosGeradosEPagosNoMesCorreto = async (predioId, mes, ano) => {
  const query = `
    SELECT rpa.*, 
           CONCAT(LPAD(r.mes, 2, '0'), '/', r.ano) AS data_vencimento
    FROM rateio_por_apartamento rpa
    JOIN rateios r ON rpa.rateio_id = r.id
    WHERE r.predio_id = ?
      AND r.mes = ?
      AND r.ano = ?
      AND rpa.data_pagamento = CONCAT(LPAD(?, 2, '0'), '/', ?)
  `;

  try {
    const [rateios] = await connection.execute(query, [predioId, mes, ano, mes, ano]);
    return rateios;
  } catch (error) {
    console.error('Erro ao buscar rateios gerados e pagos no mês correto:', error);
    throw error;
  }
};

// Função 2 – Rateios Pagos com Geração em Meses Diferentes
const getRateiosPagosGeradosEmMesesDiferentes = async (predioId, mes, ano) => {
  const query = `
    SELECT rpa.*, 
           CONCAT(LPAD(r.mes, 2, '0'), '/', r.ano) AS data_vencimento
    FROM rateio_por_apartamento rpa
    JOIN rateios r ON rpa.rateio_id = r.id
    WHERE r.predio_id = ?
      AND rpa.data_pagamento = CONCAT(LPAD(?, 2, '0'), '/', ?)
      AND NOT (r.mes = ? AND r.ano = ?)
  `;

  try {
    const [rateios] = await connection.execute(query, [predioId, mes, ano, mes, ano]);
    return rateios;
  } catch (error) {
    console.error('Erro ao buscar rateios pagos com geração em meses diferentes:', error);
    throw error;
  }
};
// Função 3 – Rateios Não Pagos 

const getRateiosNaoPagosPorPredioId = async (predioId, mes, ano) => {
  const query = `
    SELECT rpa.*, 
           CONCAT(LPAD(r.mes, 2, '0'), '/', r.ano) AS data_vencimento
    FROM rateio_por_apartamento rpa
    JOIN apartamentos apt ON rpa.apartamento_id = apt.id
    JOIN rateios r ON rpa.rateio_id = r.id
    WHERE apt.predio_id = ?
      AND (
        (r.ano < ?)
        OR (r.ano = ? AND r.mes <= ?)
      )
      AND (rpa.data_pagamento IS NULL OR rpa.data_pagamento = '')
  `;

  try {
    // Parâmetros: predioId, ano para r.ano < ?, 
    // e para r.ano = ? e r.mes <= ? (inclui o mês atual)
    const [rateios] = await connection.execute(query, [
      predioId,
      ano,
      ano,
      mes
    ]);
    return rateios;
  } catch (error) {
    console.error('Erro ao buscar rateios não pagos por predio_id:', error);
    throw error;
  }
};




const atualizarDataPagamento = async (pagamentosConsolidados) => {
  try {
    for (const pagamento of pagamentosConsolidados) {
      const { id, data_pagamento } = pagamento;

      const updateQuery = `
        UPDATE rateio_por_apartamento
        SET data_pagamento = ?
        WHERE id = ?
      `;

      await connection.execute(updateQuery, [data_pagamento, id]);
      console.log(`Data de pagamento atualizada para o ID ${id}: ${data_pagamento}`);
    }

    console.log('Atualização de data_pagamento concluída com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar data_pagamento:', error);
    throw error;
  }
};

const getRateiosEPdfsNames = async (rateioId) => {
  const query = `
    SELECT 
      rpa.apartamento_id,
      rpa.rateio_id,
      rpa.rateio_boleto_email_id,
      rpa.apt_name,
      rpa.valor,
      rbe.rateioPdfFileName,
      rbe.boletoPdfFileName
    FROM rateio_por_apartamento rpa
    LEFT JOIN rateioBoletoEmail rbe 
      ON rpa.rateio_boleto_email_id = rbe.id
    WHERE rpa.rateio_id = ?
  `;

  try {
    const [result] = await connection.execute(query, [rateioId]);
    
    // Formata o resultado para garantir campos mesmo quando não houver relacionamento
    return result.map(item => ({
      apartamento_id: item.apartamento_id,
      rateio_id: item.rateio_id,
      rateio_boleto_email_id: item.rateio_boleto_email_id || null,
      apt_name: item.apt_name,
      valor: item.valor,
      rateioPdfFileName: item.rateioPdfFileName || null,
      boletoPdfFileName: item.boletoPdfFileName || null
    }));
    
  } catch (error) {
    console.error('Erro ao buscar dados parciais do rateio:', error);
    throw error;
  }
};



module.exports = {
  getAllRateiosPorApartamento,
  getRateioPorApartamentoById,
  getRateiosPorRateioId,
  getRateioPorApartamentoByAptId,
  getRateiosNaoPagosPorPredioId,
  getRateiosGeradosEPagosNoMesCorreto,
  getRateiosPagosGeradosEmMesesDiferentes,
  getRateiosEPdfsNames,
  createRateioPorApartamento,
  updateRateioPorApartamento,
  deleteRateioPorApartamento,
  updateDataPagamento,
  atualizarDataPagamento,
  updateRateioBoletoEmailId,
  getApartamentoByRateioIdEApartamentoId
};
