const connection = require('../connection2');

// Buscar todas as limpezas extras
const getAllLimpezasExtras = async () => {
  const query = `
    SELECT le.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           COALESCE(u.first_name, 'Funcionário não encontrado') AS nome_funcionario
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    LEFT JOIN users u ON le.faxina_userId = u.id
    ORDER BY le.end_data DESC
  `;
  const [rows] = await connection.execute(query);
  return rows;
};

// Buscar uma limpeza extra por ID
const getLimpezaExtraById = async (id) => {
  const query = `
    SELECT le.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           COALESCE(u.first_name, 'Funcionário não encontrado') AS nome_funcionario
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    LEFT JOIN users u ON le.faxina_userId = u.id
    WHERE le.id = ?
  `;
  const [rows] = await connection.execute(query, [id]);
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
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    apartamento_id,
    end_data,
    Observacoes,
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
  console.log(limpeza)
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

const getLimpezasExtrasPorPeriodo = async (startDate, endDate) => {
  const query = `
    SELECT le.*,
           COALESCE(a.nome, 'Apartamento não encontrado')       AS apartamento_nome,
          COALESCE(a.valor_limpeza, 'Apartamento não encontrado') AS valor_limpeza,

           COALESCE(u.first_name, 'Funcionário não encontrado') AS nome_funcionario
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    LEFT JOIN users u       ON le.faxina_userId    = u.id
    WHERE le.end_data BETWEEN ? AND ?
    ORDER BY le.end_data ASC
  `;
  const [rows] = await connection.execute(query, [startDate, endDate]);
  return rows;
};


const getLimpezasExtrasHoje = async () => {
  const query = `
    SELECT le.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           COALESCE(u.first_name, 'Funcionário não encontrado') AS nome_funcionario
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    LEFT JOIN users u ON le.faxina_userId = u.id
    WHERE DATE(le.end_data) = CURDATE()
    ORDER BY le.end_data ASC
  `;
  const [rows] = await connection.execute(query);
  return rows;
};

const getLimpezasExtrasSemana = async () => {
  const query = `
    SELECT le.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           COALESCE(u.first_name, 'Funcionário não encontrado') AS nome_funcionario
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    LEFT JOIN users u ON le.faxina_userId = u.id
    WHERE YEARWEEK(le.end_data, 1) = YEARWEEK(CURDATE(), 1)
    ORDER BY le.end_data ASC
  `;
  const [rows] = await connection.execute(query);
  return rows;
};

const getLimpezasExtrasSemanaQueVem = async () => {
  const query = `
    SELECT le.*, 
           COALESCE(a.nome, 'Apartamento não encontrado') AS apartamento_nome,
           COALESCE(a.valor_limpeza, 'Apartamento não encontrado') AS valor_limpeza,
           
           COALESCE(u.first_name, 'Funcionário não encontrado') AS nome_funcionario
    FROM limpeza_extra le
    LEFT JOIN apartamentos a ON le.apartamento_id = a.id
    LEFT JOIN users u ON le.faxina_userId = u.id
    WHERE YEARWEEK(le.end_data, 1) = YEARWEEK(CURDATE(), 1) + 1
    ORDER BY le.end_data ASC
  `;
  const [rows] = await connection.execute(query);
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