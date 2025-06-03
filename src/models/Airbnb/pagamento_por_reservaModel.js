const connection = require('../connection2');

// 1) Lista todos os pagamentos por reserva
const getAllPagamentos = async () => {
  const [rows] = await connection.execute(`
    SELECT 
      p.*,
      a.nome AS apartamento_nome
    FROM pagamento_por_reserva p
    LEFT JOIN apartamentos a ON p.apartamento_id = a.id
    LEFT JOIN reservas r ON p.reserva_id = r.id
  `);
  return rows;
};

// 2) Busca pagamento por ID
const getPagamentoById = async (id) => {
  const [rows] = await connection.execute(
    `SELECT * FROM pagamento_por_reserva WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// 3) Cria um novo pagamento (campos fixos)
const createPagamento = async (dataObj) => {
  const {
    cod_reserva,
    taxas,
    valor_reserva,
    dataReserva,
    noites
  } = dataObj;

  // Tenta buscar a reserva com base no cod_reserva
  const [reservaRows] = await connection.execute(
    `SELECT id AS reserva_id, apartamento_id FROM reservas WHERE cod_reserva = ?`,
    [cod_reserva]
  );

  let reserva_id = null;
  let apartamento_id = null;

  if (reservaRows.length > 0) {
    reserva_id = reservaRows[0].reserva_id;
    apartamento_id = reservaRows[0].apartamento_id;
  }

  // Verifica se já existe um pagamento com os mesmos dados
  const [existing] = await connection.execute(`
    SELECT id FROM pagamento_por_reserva
    WHERE dataReserva = ? AND valor_reserva = ? AND cod_reserva = ?
  `, [dataReserva, valor_reserva, cod_reserva]);

  if (existing.length > 0) {
    throw new Error('Pagamento já cadastrado com a mesma dataReserva, valor_reserva e cod_reserva.');
  }

  // Insere o novo pagamento
  const query = `
    INSERT INTO pagamento_por_reserva 
    (apartamento_id, reserva_id, cod_reserva, taxas, valor_reserva, dataReserva, noites)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    apartamento_id,
    reserva_id,
    cod_reserva,
    taxas || 0.00,
    valor_reserva || 0.00,
    dataReserva || null,
    noites || null
  ];

  const [result] = await connection.execute(query, values);
  return { insertId: result.insertId };
};




// 4) Atualiza um pagamento (campos fixos)
const updatePagamento = async (dataObj) => {
  const {
  id,
  apartamento_id,
  reserva_id,
  cod_reserva,
  taxas,
  valor_reserva,
  dataReserva,
  noites
} = dataObj
  if (!id) throw new Error("Campo 'id' é obrigatório para update.");

  const query = `
    UPDATE pagamento_por_reserva SET
      apartamento_id = ?,
      reserva_id = ?,
      cod_reserva = ?,
      taxas = ?,
      valor_reserva = ?,
      dataReserva = ?,
      noites = ?
    WHERE id = ?
  `;
  const values = [
    apartamento_id || null,
    reserva_id || null,
    cod_reserva || null,
    taxas || 0.00,
    valor_reserva || 0.00,
    dataReserva || null,
    noites || null,
    id
  ];

  const [result] = await connection.execute(query, values);
  return result.affectedRows > 0;
};

// 5) Deleta pagamento
const deletePagamento = async (id) => {
  const [result] = await connection.execute(
    `DELETE FROM pagamento_por_reserva WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// 6) Busca pagamento por código de reserva
const getByCodReserva = async (cod_reserva) => {
  const [rows] = await connection.execute(
    `SELECT * FROM pagamento_por_reserva WHERE cod_reserva = ?`,
    [cod_reserva]
  );
  return rows;
};

// 7) Busca vários pagamentos por lista de códigos de reserva
const getByCodReservaList = async (codList) => {
  if (!Array.isArray(codList) || codList.length === 0) return [];

  const placeholders = codList.map(() => '?').join(', ');
  const query = `SELECT * FROM pagamento_por_reserva WHERE cod_reserva IN (${placeholders})`;

  const [rows] = await connection.execute(query, codList);
  return rows;
};

// 8) Busca todos os pagamentos de um apartamento específico
const getByApartamentoId = async (apartamento_id) => {
  const [rows] = await connection.execute(
    `SELECT * FROM pagamento_por_reserva WHERE apartamento_id = ?`,
    [apartamento_id]
  );
  return rows;
};

module.exports = {
  getAllPagamentos,
  getPagamentoById,
  createPagamento,
  updatePagamento,
  deletePagamento,
  getByCodReserva,
  getByCodReservaList,
  getByApartamentoId
};
