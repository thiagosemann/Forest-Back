const connection = require('../connection2');

// Função para buscar todos os prédios
const getAllPredios = async (empresaId) => {
  let query = 'SELECT * FROM predios';
  let params = [];
  if (empresaId) {
    query += ' WHERE empresa_id = ?';
    params.push(empresaId);
  }
  const [predios] = await connection.execute(query, params);
  return predios;
};

// Função para criar um novo prédio
const createPredio = async (predio) => {
  const {
    nome,
    piscina,
    academia,
    churrasqueira,
    salao_de_festas,
    espaco_gourmet,
    sauna,
    spa,
    salao_de_jogos,
    coworking,
    jardim_terraco,
    lavanderia,
    bicicletario,
    estacionamento_visitas,
    elevador_social,
    empresa_id // novo campo
  } = predio;

  const insertQuery = `
    INSERT INTO predios (
      nome,
      piscina,
      academia,
      churrasqueira,
      salao_de_festas,
      espaco_gourmet,
      sauna,
      spa,
      salao_de_jogos,
      coworking,
      jardim_terraco,
      lavanderia,
      bicicletario,
      estacionamento_visitas,
      elevador_social,
      empresa_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    nome,
    piscina || 0,
    academia || 0,
    churrasqueira || 0,
    salao_de_festas || 0,
    espaco_gourmet || 0,
    sauna || 0,
    spa || 0,
    salao_de_jogos || 0,
    coworking || 0,
    jardim_terraco || 0,
    lavanderia || 0,
    bicicletario || 0,
    estacionamento_visitas || 0,
    elevador_social || 0,
    empresa_id // novo valor
  ];

  try {
    const [result] = await connection.execute(insertQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir prédio:', error);
    throw error;
  }
};

// Função para buscar um prédio pelo ID
const getPredioById = async (id, empresaId) => {
  let query = 'SELECT * FROM predios WHERE id = ?';
  let params = [id];
  if (empresaId) {
    query += ' AND empresa_id = ?';
    params.push(empresaId);
  }
  const [predios] = await connection.execute(query, params);
  return predios.length > 0 ? predios[0] : null;
};

// Função para atualizar um prédio
const updatePredio = async (predio) => {
  const {
    id,
    nome,
    piscina,
    academia,
    churrasqueira,
    salao_de_festas,
    espaco_gourmet,
    sauna,
    spa,
    salao_de_jogos,
    coworking,
    jardim_terraco,
    lavanderia,
    bicicletario,
    estacionamento_visitas,
    elevador_social,
  } = predio;

  const updateQuery = `
    UPDATE predios SET
      nome = ?,
      piscina = ?,
      academia = ?,
      churrasqueira = ?,
      salao_de_festas = ?,
      espaco_gourmet = ?,
      sauna = ?,
      spa = ?,
      salao_de_jogos = ?,
      coworking = ?,
      jardim_terraco = ?,
      lavanderia = ?,
      bicicletario = ?,
      estacionamento_visitas = ?,
      elevador_social = ?
    WHERE id = ?
  `;

  const values = [
    nome,
    piscina || 0,
    academia || 0,
    churrasqueira || 0,
    salao_de_festas || 0,
    espaco_gourmet || 0,
    sauna || 0,
    spa || 0,
    salao_de_jogos || 0,
    coworking || 0,
    jardim_terraco || 0,
    lavanderia || 0,
    bicicletario || 0,
    estacionamento_visitas || 0,
    elevador_social || 0,
    id,
  ];

  try {
    const [result] = await connection.execute(updateQuery, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar prédio:', error);
    throw error;
  }
};

// Função para deletar um prédio pelo ID
const deletePredio = async (id) => {
  const query = 'DELETE FROM predios WHERE id = ?';

  try {
    const [result] = await connection.execute(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar prédio:', error);
    throw error;
  }
};

module.exports = {
  getAllPredios,
  createPredio,
  getPredioById,
  updatePredio,
  deletePredio,
};
