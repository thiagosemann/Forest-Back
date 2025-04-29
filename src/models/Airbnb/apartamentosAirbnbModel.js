const connection = require('../connection2');

// Função para buscar todos os apartamentos
const getAllApartamentos = async () => {
  const [apartamentos] = await connection.execute('SELECT * FROM apartamentos');
  return apartamentos;
};

// Função para criar um novo apartamento com valores opcionais
const createApartamento = async (apartamento) => {
  console.log("Dados recebidos para inserção:", apartamento);

  if (!apartamento.nome || !apartamento.predio_id) {
    throw new Error("Os campos 'nome' e 'predio_id' são obrigatórios.");
  }

  const {
    nome, predio_id, link_airbnb_calendario, nome_anuncio, endereco, bairro,
    proprietario_id, senha_porta, data_troca, totem, adesivo_aviso, andar,
    numero_hospedes, porcentagem_cobrada, valor_enxoval, valor_limpeza,
    qtd_cama_solteiro, qtd_cama_casal, qtd_sofa_cama, aceita_pet, tipo_checkin,
    acesso_predio, link_app, acesso_porta, secador_cabelo, cafeteira,
    ventilador, ferro_passar, sanduicheira, chaleira_eletrica, liquidificador,
    smart_tv, tv_aberta, tipo_chuveiro, escritorio, tv_quarto, ar_condicionado,
    aspirador_de_po, qtd_taca_vinho, tipo_fogao, respostas_programadas,
    ssid_wifi, senha_wifi, user_prioridade1, user_prioridade2, user_prioridade3,
    aquecedor,vaga_garagem ,itens_limpeza,air_fryer,modificado_user_id,data_ultima_modificacao,link_fotos
  } = apartamento;

  const insertApartamentoQuery = `
  INSERT INTO apartamentos SET 
    nome = ?, 
    predio_id = ?, 
    link_airbnb_calendario = ?, 
    nome_anuncio = ?, 
    endereco = ?, 
    bairro = ?, 
    proprietario_id = ?, 
    senha_porta = ?, 
    data_troca = ?, 
    totem = ?, 
    adesivo_aviso = ?, 
    andar = ?, 
    numero_hospedes = ?, 
    porcentagem_cobrada = ?, 
    valor_enxoval = ?, 
    valor_limpeza = ?, 
    qtd_cama_solteiro = ?, 
    qtd_cama_casal = ?, 
    qtd_sofa_cama = ?, 
    aceita_pet = ?, 
    tipo_checkin = ?, 
    acesso_predio = ?, 
    link_app = ?, 
    acesso_porta = ?, 
    secador_cabelo = ?, 
    cafeteira = ?, 
    ventilador = ?, 
    ferro_passar = ?, 
    sanduicheira = ?, 
    chaleira_eletrica = ?, 
    liquidificador = ?, 
    smart_tv = ?, 
    tv_aberta = ?, 
    tipo_chuveiro = ?, 
    escritorio = ?, 
    tv_quarto = ?, 
    ar_condicionado = ?, 
    aspirador_de_po = ?, 
    qtd_taca_vinho = ?, 
    tipo_fogao = ?, 
    respostas_programadas = ?, 
    ssid_wifi = ?, 
    senha_wifi = ?, 
    user_prioridade1 = ?, 
    user_prioridade2 = ?, 
    user_prioridade3 = ?,
    aquecedor = ?,
    vaga_garagem = ?,
    itens_limpeza = ?,
    air_fryer = ?,
    modificado_user_id = ?,
    data_ultima_modificacao = ?,
    link_fotos = ?;
`;

  const values = [
    nome, predio_id, link_airbnb_calendario ?? null, nome_anuncio ?? null, endereco ?? null, bairro ?? null,
    proprietario_id ?? null, senha_porta ?? null, data_troca ?? null, totem ?? null, adesivo_aviso ?? null, andar ?? null,
    numero_hospedes ?? null, porcentagem_cobrada ?? null, valor_enxoval ?? null, valor_limpeza ?? null,
    qtd_cama_solteiro ?? null, qtd_cama_casal ?? null, qtd_sofa_cama ?? null, aceita_pet ?? null, tipo_checkin ?? null,
    acesso_predio ?? null, link_app ?? null, acesso_porta ?? null, secador_cabelo ?? null, cafeteira ?? null,
    ventilador ?? null, ferro_passar ?? null, sanduicheira ?? null, chaleira_eletrica ?? null, liquidificador ?? null,
    smart_tv ?? null, tv_aberta ?? null, tipo_chuveiro ?? null, escritorio ?? null, tv_quarto ?? null, ar_condicionado ?? null,
    aspirador_de_po ?? null, qtd_taca_vinho ?? null, tipo_fogao ?? null, respostas_programadas ?? null,
    ssid_wifi ?? null, senha_wifi ?? null, user_prioridade1 ?? null, user_prioridade2 ?? null, user_prioridade3 ?? null,
    aquecedor ?? null,vaga_garagem ?? null ,itens_limpeza ?? null, air_fryer ?? null, modificado_user_id ?? null,data_ultima_modificacao ?? null,link_fotos ?? null
  ];

  try {
    const [result] = await connection.execute(insertApartamentoQuery, values);
    console.log("Apartamento inserido com sucesso, ID:", result.insertId);
    return { insertId: result.insertId };
  } catch (error) {
    console.error("Erro ao inserir apartamento:", error);
    
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Já existe um apartamento com os mesmos dados.");
    }
    
    throw new Error("Erro ao inserir apartamento no banco de dados.");
  }
};

// Função para atualizar um apartamento com valores opcionais
const updateApartamento = async (apartamento) => {
  const {
    id,
    nome = null,
    predio_id = null,
    link_airbnb_calendario = null,
    nome_anuncio = null,
    endereco = null,
    bairro = null,
    proprietario_id = null,
    senha_porta = null,
    data_troca = null,
    totem = null,
    adesivo_aviso = null,
    andar = null,
    numero_hospedes = null,
    porcentagem_cobrada = null,
    valor_enxoval = null,
    valor_limpeza = null,
    qtd_cama_solteiro = null,
    qtd_cama_casal = null,
    qtd_sofa_cama = null,
    aceita_pet = null,
    tipo_checkin = null,
    acesso_predio = null,
    link_app = null,
    acesso_porta = null,
    secador_cabelo = null,
    cafeteira = null,
    ventilador = null,
    ferro_passar = null,
    sanduicheira = null,
    chaleira_eletrica = null,
    liquidificador = null,
    smart_tv = null,
    tv_aberta = null,
    tipo_chuveiro = null,
    escritorio = null,
    tv_quarto = null,
    ar_condicionado = null,
    aspirador_de_po = null,
    qtd_taca_vinho = null,
    tipo_fogao = null,
    respostas_programadas = null,
    ssid_wifi = null,
    senha_wifi = null,
    user_prioridade1 = null,
    user_prioridade2 = null,
    user_prioridade3 = null,
    aquecedor = null,
    vaga_garagem = null,
    itens_limpeza = null,
    air_fryer = null,
    modificado_user_id = null,
    data_ultima_modificacao = null,
    link_fotos = null,
  } = apartamento;

  const updateApartamentoQuery = `
    UPDATE apartamentos SET
      nome = ?, predio_id = ?, link_airbnb_calendario = ?, nome_anuncio = ?, endereco = ?, bairro = ?,
      proprietario_id = ?, senha_porta = ?, data_troca = ?, totem = ?, adesivo_aviso = ?, andar = ?,
      numero_hospedes = ?, porcentagem_cobrada = ?, valor_enxoval = ?, valor_limpeza = ?,
      qtd_cama_solteiro = ?, qtd_cama_casal = ?, qtd_sofa_cama = ?, aceita_pet = ?, tipo_checkin = ?,
      acesso_predio = ?, link_app = ?, acesso_porta = ?, secador_cabelo = ?, cafeteira = ?,
      ventilador = ?, ferro_passar = ?, sanduicheira = ?, chaleira_eletrica = ?, liquidificador = ?,
      smart_tv = ?, tv_aberta = ?, tipo_chuveiro = ?, escritorio = ?, tv_quarto = ?, ar_condicionado = ?,
      aspirador_de_po = ?, qtd_taca_vinho = ?, tipo_fogao = ?, respostas_programadas = ?,
      ssid_wifi = ?, senha_wifi = ?, user_prioridade1 = ?, user_prioridade2 = ?, user_prioridade3 = ?,
      aquecedor = ?,vaga_garagem = ?,itens_limpeza = ?, air_fryer = ?,modificado_user_id  = ?,data_ultima_modificacao  = ? , link_fotos = ?
    WHERE id = ?
  `;

  const values = [
    nome, predio_id, link_airbnb_calendario, nome_anuncio, endereco, bairro,
    proprietario_id, senha_porta, data_troca, totem, adesivo_aviso, andar,
    numero_hospedes, porcentagem_cobrada, valor_enxoval, valor_limpeza,
    qtd_cama_solteiro, qtd_cama_casal, qtd_sofa_cama, aceita_pet, tipo_checkin,
    acesso_predio, link_app, acesso_porta, secador_cabelo, cafeteira,
    ventilador, ferro_passar, sanduicheira, chaleira_eletrica, liquidificador,
    smart_tv, tv_aberta, tipo_chuveiro, escritorio, tv_quarto, ar_condicionado,
    aspirador_de_po, qtd_taca_vinho, tipo_fogao, respostas_programadas,
    ssid_wifi, senha_wifi, user_prioridade1, user_prioridade2, user_prioridade3,
    aquecedor,vaga_garagem ,itens_limpeza,air_fryer,modificado_user_id,data_ultima_modificacao,link_fotos,
    id
  ];

  try {
    const [result] = await connection.execute(updateApartamentoQuery, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar apartamento:', error);
    throw error;
  }
};
// Função para buscar um apartamento pelo ID
const getApartamentoById = async (id) => {
  const query = 'SELECT * FROM apartamentos WHERE id = ?';
  const [apartamentos] = await connection.execute(query, [id]);

  if (apartamentos.length > 0) {
    return apartamentos[0];
  } else {
    return null;
  }
};

// Função para buscar apartamentos pelo ID do prédio
const getApartamentosByPredioId = async (predioId) => {
  const query = 'SELECT * FROM apartamentos WHERE predio_id = ?';
  const [apartamentos] = await connection.execute(query, [predioId]);
  return apartamentos;
};

// Função para deletar um apartamento pelo ID
const deleteApartamento = async (id) => {
  const deleteApartamentoQuery = 'DELETE FROM apartamentos WHERE id = ?';

  try {
    const [result] = await connection.execute(deleteApartamentoQuery, [id]);
    return result.affectedRows > 0; // Retorna true se o apartamento foi deletado com sucesso
  } catch (error) {
    console.error('Erro ao deletar apartamento:', error);
    throw error;
  }
};

module.exports = {
  getAllApartamentos,
  createApartamento,
  getApartamentoById,
  getApartamentosByPredioId,
  updateApartamento,
  deleteApartamento
};
