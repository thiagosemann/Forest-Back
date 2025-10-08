const connection = require('../connection2');

// 1) Lista todos os pagamentos por reserva
const getAllPagamentos = async () => {
  const [rows] = await connection.execute(`
    SELECT 
      p.*, 
      a.nome AS apartamento_nome
    FROM pagamento_por_reserva p
    LEFT JOIN apartamentos a ON p.apt_id = a.id
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

// 3) Cria um novo pagamento (novos campos)
const createPagamento = async (dataObj) => {
  const {
    // chaves de relacionamento
    apt_id: aptIdInput,
    reserva_id: reservaIdInput,
    cod_reserva,
    // dados
    noites,
    fonte,
    tipo,
    pagamento_total,
    taxas,
    valor_sem_taxa,
    valor_limpeza,
    valor_forest,
    valor_repasse_proprietario
  } = dataObj;

  // Tenta buscar reserva/apt com base no cod_reserva quando não informados
  let reserva_id = reservaIdInput ?? null;
  let apt_id = aptIdInput ?? null;

  if ((!reserva_id || !apt_id) && cod_reserva) {
    const [reservaRows] = await connection.execute(
      `SELECT id AS reserva_id, apartamento_id AS apt_id FROM reservas WHERE cod_reserva = ? ORDER BY id DESC LIMIT 1`,
      [cod_reserva]
    );
    if (reservaRows.length > 0) {
      reserva_id = reserva_id ?? reservaRows[0].reserva_id;
      apt_id = apt_id ?? reservaRows[0].apt_id;
    }
  }

  // Verifica se já existe um pagamento com a mesma combinação (cod_reserva + fonte + tipo)
  if (cod_reserva && fonte && tipo) {
    const [existing] = await connection.execute(
      `SELECT id FROM pagamento_por_reserva WHERE cod_reserva = ? AND fonte = ? AND tipo = ? LIMIT 1`,
      [cod_reserva, fonte, tipo]
    );
    if (existing.length > 0) {
      throw new Error('Pagamento já cadastrado para este cod_reserva, fonte e tipo.');
    }
  }

  // Insere o novo pagamento
  const query = `
    INSERT INTO pagamento_por_reserva 
    (apt_id, reserva_id, cod_reserva, noites, fonte, tipo, pagamento_total, taxas, valor_sem_taxa, valor_limpeza, valor_forest, valor_repasse_proprietario)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    apt_id || null,
    reserva_id || null,
    cod_reserva || null,
    Number.isFinite(noites) ? noites : (noites ? Number(noites) : 0),
    fonte || null,
    tipo || null,
    pagamento_total != null ? Number(pagamento_total) : 0.0,
    taxas != null ? Number(taxas) : 0.0,
    valor_sem_taxa != null ? Number(valor_sem_taxa) : 0.0,
    valor_limpeza != null ? Number(valor_limpeza) : 0.0,
    valor_forest != null ? Number(valor_forest) : 0.0,
    valor_repasse_proprietario != null ? Number(valor_repasse_proprietario) : 0.0
  ];

  const [result] = await connection.execute(query, values);
  return { insertId: result.insertId };
};

// 4) Atualiza um pagamento (novos campos)
const updatePagamento = async (dataObj) => {
  const {
    id,
    apt_id,
    reserva_id,
    cod_reserva,
    noites,
    fonte,
    tipo,
    pagamento_total,
    taxas,
    valor_sem_taxa,
    valor_limpeza,
    valor_forest,
    valor_repasse_proprietario
  } = dataObj;

  if (!id) throw new Error("Campo 'id' é obrigatório para update.");

  const query = `
    UPDATE pagamento_por_reserva SET
      apt_id = ?,
      reserva_id = ?,
      cod_reserva = ?,
      noites = ?,
      fonte = ?,
      tipo = ?,
      pagamento_total = ?,
      taxas = ?,
      valor_sem_taxa = ?,
      valor_limpeza = ?,
      valor_forest = ?,
      valor_repasse_proprietario = ?
    WHERE id = ?
  `;

  const values = [
    apt_id || null,
    reserva_id || null,
    cod_reserva || null,
    Number.isFinite(noites) ? noites : (noites ? Number(noites) : 0),
    fonte || null,
    tipo || null,
    pagamento_total != null ? Number(pagamento_total) : 0.0,
    taxas != null ? Number(taxas) : 0.0,
    valor_sem_taxa != null ? Number(valor_sem_taxa) : 0.0,
    valor_limpeza != null ? Number(valor_limpeza) : 0.0,
    valor_forest != null ? Number(valor_forest) : 0.0,
    valor_repasse_proprietario != null ? Number(valor_repasse_proprietario) : 0.0,
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
    `SELECT * FROM pagamento_por_reserva WHERE apt_id = ?`,
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
