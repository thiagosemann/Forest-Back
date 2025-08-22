const connection = require('../connection2');

// Buscar todas as limpezas extras
const getAllLimpezasExtras = async (empresaId) => {
  const query = `
    SELECT le.*,
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           COALESCE(a.senha_porta, '')            AS apartamento_senha
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    WHERE a.empresa_id = ?
    ORDER BY le.end_data DESC
  `;
  const [rows] = await connection.execute(query, [empresaId]);
  return rows;
};

// Buscar uma limpeza extra por ID
const getLimpezaExtraById = async (id, empresaId) => {
  const query = `
    SELECT le.*,
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           COALESCE(a.senha_porta, '')            AS apartamento_senha
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    WHERE le.id = ? AND a.empresa_id = ?
  `;
  const [rows] = await connection.execute(query, [id, empresaId]);
  return rows[0] || null;
};

// Criar nova limpeza extra
const createLimpezaExtra = async (limpeza) => {
  const {
    apartamento_id,
    end_data,
    Observacoes,
    limpeza_realizada,
    faxina_userId
  } = limpeza;

  const query = `
    INSERT INTO limpeza_extra (
      apartamento_id,
      end_data,
      Observacoes,
      limpeza_realizada,
      faxina_userId
    ) VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    apartamento_id,
    end_data,
    Observacoes || '',
    limpeza_realizada ? 1 : 0,
    faxina_userId || null
  ];

  const [result] = await connection.execute(query, values);
  return { insertId: result.insertId };
};

// Atualizar uma limpeza extra
const updateLimpezaExtra = async (limpeza) => {
  const {
    id,
    apartamento_id,
    end_data,
    Observacoes,
    limpeza_realizada,
    faxina_userId
  } = limpeza;

  const query = `
    UPDATE limpeza_extra
    SET apartamento_id    = ?,
        end_data          = ?,
        Observacoes       = ?,
        limpeza_realizada = ?,
        faxina_userId     = ?
    WHERE id = ?
  `;

  const values = [
    apartamento_id,
    end_data,
    Observacoes,
    limpeza_realizada ? 1 : 0,
    faxina_userId || null,
    id
  ];

  const [result] = await connection.execute(query, values);
  return result.affectedRows > 0;
};

// Deletar uma limpeza extra
const deleteLimpezaExtra = async (id) => {
  const query = 'DELETE FROM limpeza_extra WHERE id = ?';
  const [result] = await connection.execute(query, [id]);
  return result.affectedRows > 0;
};

// Buscar limpezas extras por período
const getLimpezasExtrasPorPeriodo = async (startDate, endDate, empresaId) => {
  const query = `
    SELECT le.*,
           COALESCE(a.nome, 'Apartamento não encontrado')       AS apartamento_nome,
           COALESCE(a.valor_limpeza, 0)                        AS valor_limpeza,
           COALESCE(a.senha_porta, '')                          AS apartamento_senha
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    WHERE le.end_data BETWEEN ? AND ? AND a.empresa_id = ?
    ORDER BY le.end_data ASC
  `;
  const [rows] = await connection.execute(query, [startDate, endDate, empresaId]);
  return rows;
};

// Buscar limpezas extras de hoje
const getLimpezasExtrasHoje = async (empresaId) => {
  const query = `
    SELECT le.*,
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           COALESCE(a.senha_porta, '')                     AS apartamento_senha
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    WHERE DATE(le.end_data) = CURDATE() AND a.empresa_id = ?
    ORDER BY le.end_data ASC
  `;
  const [rows] = await connection.execute(query, [empresaId]);
  return rows;
};

// Buscar limpezas extras desta semana
const getLimpezasExtrasSemana = async (empresaId) => {
  const query = `
    SELECT le.*,
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           COALESCE(a.senha_porta, '')                     AS apartamento_senha
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    WHERE YEARWEEK(le.end_data, 1) = YEARWEEK(CURDATE(), 1) AND a.empresa_id = ?
    ORDER BY le.end_data ASC
  `;
  const [rows] = await connection.execute(query, [empresaId]);
  return rows;
};

// Buscar limpezas extras da semana que vem
const getLimpezasExtrasSemanaQueVem = async (empresaId) => {
  const query = `
    SELECT le.*,
           COALESCE(a.nome, 'Apartamento não encontrado')       AS apartamento_nome,
           COALESCE(a.valor_limpeza, 0)                        AS valor_limpeza,
           COALESCE(a.senha_porta, '')                          AS apartamento_senha
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    WHERE YEARWEEK(le.end_data, 1) = YEARWEEK(CURDATE(), 1) + 1 AND a.empresa_id = ?
    ORDER BY le.end_data ASC
  `;
  const [rows] = await connection.execute(query, [empresaId]);
  return rows;
};


module.exports = {
  getAllLimpezasExtras,
  getLimpezaExtraById,
  createLimpezaExtra,
  updateLimpezaExtra,
  deleteLimpezaExtra,
  getLimpezasExtrasHoje,
  getLimpezasExtrasSemana,
  getLimpezasExtrasSemanaQueVem,
  getLimpezasExtrasPorPeriodo
};
