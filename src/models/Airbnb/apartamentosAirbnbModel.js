// apartamentosModel.js
const connection = require('../connection2');

const getCurrentDateTimeString = () => {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace('T', ' '); // Formato: YYYY-MM-DD HH:MM:SS
};

// Função para buscar todos os apartamentos
const getAllApartamentos = async () => {
  const query = `
    SELECT a.*, p.nome AS predio_name
    FROM apartamentos a
    LEFT JOIN predios p ON a.predio_id = p.id
    WHERE a.is_active = 1
  `;
  const [apartamentos] = await connection.execute(query);
  return apartamentos;
};

const createApartamento = async (apartamento) => {
  if (!apartamento.nome || !apartamento.predio_id) {
    throw new Error("Os campos 'nome' e 'predio_id' são obrigatórios.");
  }
  const {
    nome,
    predio_id,
    link_airbnb_calendario,
    link_booking_calendario,
    link_stays_calendario, // NOVO
    link_ayrton_calendario, // NOVO
    nome_anuncio,
    endereco,
    bairro,
    proprietario_id,
    senha_porta,
    data_troca,
    totem,
    adesivo_aviso,
    andar,
    numero_hospedes,
    porcentagem_cobrada,
    valor_enxoval,
    valor_limpeza,
    enxoval_sobre_lencol_casal = null,
    enxoval_fronha = null,
    enxoval_sobre_lencol_solteiro = null,
    enxoval_toalhas = null,
    enxoval_pisos = null,
    enxoval_rostos = null,
    qtd_cama_solteiro,
    qtd_cama_casal,
    qtd_sofa_cama,
    qtd_banheiros, // NOVO
    aceita_pet,
    tipo_checkin,
    acesso_predio,
    link_app,
    acesso_porta,
    secador_cabelo,
    cafeteira,
    ventilador,
    ferro_passar,
    sanduicheira,
    chaleira_eletrica,
    liquidificador,
    smart_tv,
    tv_aberta,
    tipo_chuveiro,
    escritorio,
    tv_quarto,
    ar_condicionado,
    aspirador_de_po,
    qtd_taca_vinho,
    tipo_fogao,
    respostas_programadas,
    ssid_wifi,
    senha_wifi,
    user_prioridade1,
    user_prioridade2,
    user_prioridade3,
    aquecedor,
    vaga_garagem,
    tem_garagem, // NOVO
    itens_limpeza,
    air_fryer,
    modificado_user_id,
    data_ultima_modificacao,
    link_fotos,
    cod_link_proprietario,
    empresa_id,
    link_anuncio_airbnb = null, // Garante null se não vier
    link_anuncio_booking = null, // Garante null se não vier
    categoria = null, // NOVO
    tipo_anuncio_repasse = null,
    pedir_selfie = null,
    is_active = 1,
  } = apartamento;

  const insertApartamentoQuery = `
  INSERT INTO apartamentos SET 
    nome = ?, 
    predio_id = ?, 
    link_airbnb_calendario = ?,
    link_booking_calendario = ?,
    link_stays_calendario = ?,
    link_ayrton_calendario = ?,
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
    qtd_banheiros = ?, 
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
    tem_garagem = ?,
    itens_limpeza = ?,
    air_fryer = ?,
    modificado_user_id = ?,
    data_ultima_modificacao = ?,
    link_fotos = ?,
    cod_link_proprietario = ?,
    empresa_id = ?,
    link_anuncio_airbnb = ?,
    link_anuncio_booking = ?,
    categoria = ?,
    tipo_anuncio_repasse = ?,
    pedir_selfie = ?,
    is_active = ?,
    enxoval_sobre_lencol_casal = ?,
    enxoval_fronha = ?,
    enxoval_sobre_lencol_solteiro = ?,
    enxoval_toalhas = ?,
    enxoval_pisos = ?,
    enxoval_rostos = ?
  `;

  const values = [
    nome,
    predio_id,
    link_airbnb_calendario ?? null,
    link_booking_calendario ?? null,
    link_stays_calendario ?? null,
    link_ayrton_calendario ?? null,
    nome_anuncio ?? null,
    endereco ?? null,
    bairro ?? null,
    proprietario_id ?? null,
    senha_porta ?? null,
    data_troca ?? null,
    totem ?? null,
    adesivo_aviso ?? null,
    andar ?? null,
    numero_hospedes ?? null,
    porcentagem_cobrada ?? null,
    valor_enxoval ?? null,
    valor_limpeza ?? null,
    qtd_cama_solteiro ?? null,
    qtd_cama_casal ?? null,
    qtd_sofa_cama ?? null,
    qtd_banheiros ?? null,
    aceita_pet ?? null,
    tipo_checkin ?? null,
    acesso_predio ?? null,
    link_app ?? null,
    acesso_porta ?? null,
    secador_cabelo ?? null,
    cafeteira ?? null,
    ventilador ?? null,
    ferro_passar ?? null,
    sanduicheira ?? null,
    chaleira_eletrica ?? null,
    liquidificador ?? null,
    smart_tv ?? null,
    tv_aberta ?? null,
    tipo_chuveiro ?? null,
    escritorio ?? null,
    tv_quarto ?? null,
    ar_condicionado ?? null,
    aspirador_de_po ?? null,
    qtd_taca_vinho ?? null,
    tipo_fogao ?? null,
    respostas_programadas ?? null,
    ssid_wifi ?? null,
    senha_wifi ?? null,
    user_prioridade1 ?? null,
    user_prioridade2 ?? null,
    user_prioridade3 ?? null,
    aquecedor ?? null,
    vaga_garagem ?? null,
    tem_garagem ?? null, // NOVO
    itens_limpeza ?? null,
    air_fryer ?? null,
    modificado_user_id ?? null,
    getCurrentDateTimeString(),
    link_fotos ?? null,
    cod_link_proprietario ?? null,
    empresa_id,
    link_anuncio_airbnb ?? null,
    link_anuncio_booking ?? null,
    categoria ?? null,
    tipo_anuncio_repasse ?? null,
    pedir_selfie ?? null,
    is_active ?? 1,
    enxoval_sobre_lencol_casal ?? null,
    enxoval_fronha ?? null,
    enxoval_sobre_lencol_solteiro ?? null,
    enxoval_toalhas ?? null,
    enxoval_pisos ?? null,
    enxoval_rostos ?? null
  ];

  try {
    const [result] = await connection.execute(insertApartamentoQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error("Erro ao inserir apartamento:", error);
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Já existe um apartamento com os mesmos dados.");
    }
    throw new Error("Erro ao inserir apartamento no banco de dados.");
  }
};

// Atualização da função updateApartamento com cod_link_proprietario
const updateApartamento = async (apartamento) => {
  const {
    id,
    nome = null,
    predio_id = null,
    link_airbnb_calendario = null,
    link_booking_calendario = null,
    link_stays_calendario = null, // NOVO
    link_ayrton_calendario = null, // NOVO
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
    enxoval_sobre_lencol_casal = null,
    enxoval_fronha = null,
    enxoval_sobre_lencol_solteiro = null,
    enxoval_toalhas = null,
    enxoval_pisos = null,
    enxoval_rostos = null,
    qtd_cama_solteiro = null,
    qtd_cama_casal = null,
    qtd_sofa_cama = null,
    qtd_banheiros = null, // NOVO
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
    tem_garagem = null, // NOVO
    itens_limpeza = null,
    air_fryer = null,
    modificado_user_id = null,
    data_ultima_modificacao = null,
    link_fotos = null,
    cod_link_proprietario = null,
    link_anuncio_airbnb = null, // Garante null se não vier
    link_anuncio_booking = null, // Garante null se não vier
    categoria = null, // NOVO
    tipo_anuncio_repasse = null,
    pedir_selfie = null
  } = apartamento;

  const updateApartamentoQuery = `
    UPDATE apartamentos SET
      nome = ?,
      predio_id = ?,
      link_airbnb_calendario = ?,
      link_booking_calendario = ?,
      link_stays_calendario = ?,
      link_ayrton_calendario = ?,
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
      qtd_banheiros = ?,
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
      tem_garagem = ?,
      itens_limpeza = ?,
      air_fryer = ?,
      modificado_user_id = ?,
      data_ultima_modificacao = ?,
      link_fotos = ?,
      cod_link_proprietario = ?,
      link_anuncio_airbnb = ?,
      link_anuncio_booking = ?,
      categoria = ?,
      tipo_anuncio_repasse = ?,
      pedir_selfie = ?,
      enxoval_sobre_lencol_casal = ?,
      enxoval_fronha = ?,
      enxoval_sobre_lencol_solteiro = ?,
      enxoval_toalhas = ?,
      enxoval_pisos = ?,
      enxoval_rostos = ?
    WHERE id = ?
  `;

  const values = [
    nome,
    predio_id,
    link_airbnb_calendario,
    link_booking_calendario,
    link_stays_calendario,
    link_ayrton_calendario,
    nome_anuncio,
    endereco,
    bairro,
    proprietario_id,
    senha_porta,
    data_troca,
    totem,
    adesivo_aviso,
    andar,
    numero_hospedes,
    porcentagem_cobrada,
    valor_enxoval,
    valor_limpeza,
    qtd_cama_solteiro,
    qtd_cama_casal,
    qtd_sofa_cama,
    qtd_banheiros,
    aceita_pet,
    tipo_checkin,
    acesso_predio,
    link_app,
    acesso_porta,
    secador_cabelo,
    cafeteira,
    ventilador,
    ferro_passar,
    sanduicheira,
    chaleira_eletrica,
    liquidificador,
    smart_tv,
    tv_aberta,
    tipo_chuveiro,
    escritorio,
    tv_quarto,
    ar_condicionado,
    aspirador_de_po,
    qtd_taca_vinho,
    tipo_fogao,
    respostas_programadas,
    ssid_wifi,
    senha_wifi,
    user_prioridade1,
    user_prioridade2,
    user_prioridade3,
    aquecedor,
    vaga_garagem,
    tem_garagem,
    itens_limpeza,
    air_fryer,
    modificado_user_id,
    getCurrentDateTimeString(),
    link_fotos,
    cod_link_proprietario,
    link_anuncio_airbnb ?? null,
    link_anuncio_booking ?? null,
    categoria ?? null,
    tipo_anuncio_repasse ?? null,
    pedir_selfie,
    enxoval_sobre_lencol_casal,
    enxoval_fronha,
    enxoval_sobre_lencol_solteiro,
    enxoval_toalhas,
    enxoval_pisos,
    enxoval_rostos,
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
  const query = 'SELECT * FROM apartamentos WHERE id = ? AND is_active = 1';
  const [apartamentos] = await connection.execute(query, [id]);

  return apartamentos.length > 0 ? apartamentos[0] : null;
};

// Função para buscar um apartamento pelo ID
const getApartamentoByCodProprietario = async (cod_link_proprietario) => {
  const query = 'SELECT * FROM apartamentos WHERE cod_link_proprietario = ? AND is_active = 1';
  const [apartamentos] = await connection.execute(query, [cod_link_proprietario]);

  return apartamentos.length > 0 ? apartamentos[0] : null;
};

// Função para buscar apartamentos pelo ID do prédio
const getApartamentosByPredioId = async (predioId) => {
  const query = 'SELECT * FROM apartamentos WHERE predio_id = ? AND is_active = 1';
  const [apartamentos] = await connection.execute(query, [predioId]);
  return apartamentos;
};

// Função para deletar um apartamento pelo ID
const deleteApartamento = async (id) => {
  const [result] = await connection.execute(
    'UPDATE apartamentos SET is_active = 0, data_ultima_modificacao = ? WHERE id = ?',
    [getCurrentDateTimeString(), id]
  );
  return result.affectedRows > 0;
};

// Buscar todos os apartamentos de uma empresa
const getAllApartamentosByEmpresa = async (empresaId) => {
  const query = `
    SELECT a.*, p.nome AS predio_name, u.first_name AS modificado_user_nome
    FROM apartamentos a
    LEFT JOIN predios p ON a.predio_id = p.id
    LEFT JOIN users u ON a.modificado_user_id = u.id
    WHERE a.empresa_id = ? AND a.is_active = 1
  `;
  const [apartamentos] = await connection.execute(query, [empresaId]);
  return apartamentos;
};

// Buscar todos os apartamentos INATIVOS (is_active = 0) de uma empresa
const getApartamentosInativosByEmpresa = async (empresaId) => {
  const query = `
    SELECT a.*, p.nome AS predio_name, u.first_name AS modificado_user_nome
    FROM apartamentos a
    LEFT JOIN predios p ON a.predio_id = p.id
    LEFT JOIN users u ON a.modificado_user_id = u.id
    WHERE a.empresa_id = ? AND a.is_active = 0
  `;
  const [apartamentos] = await connection.execute(query, [empresaId]);
  return apartamentos;
};

// Buscar apartamento por id e empresa
const getApartamentoByIdAndEmpresa = async (id, empresaId) => {
  const [apartamentos] = await connection.execute('SELECT * FROM apartamentos WHERE id = ? AND empresa_id = ? AND is_active = 1', [id, empresaId]);
  return apartamentos.length > 0 ? apartamentos[0] : null;
};

// Buscar apartamentos por prédio e empresa
const getApartamentosByPredioIdAndEmpresa = async (predioId, empresaId) => {
  const [apartamentos] = await connection.execute('SELECT * FROM apartamentos WHERE predio_id = ? AND empresa_id = ? AND is_active = 1', [predioId, empresaId]);
  return apartamentos;
};

// Nova função: retorna vaga_garagem, pedir_selfie e tem_garagem por apartamento_id
const getVagaSelfieTemGaragem = async (apartamento_id) => {
  const [rows] = await connection.execute(
    'SELECT vaga_garagem, pedir_selfie, tem_garagem FROM apartamentos WHERE id = ? AND is_active = 1',
    [apartamento_id]
  );
  return rows[0] || null;
};

module.exports = {
  getAllApartamentos,
  createApartamento,
  getApartamentoById,
  getApartamentoByCodProprietario,
  getApartamentosByPredioId,
  updateApartamento,
  deleteApartamento,
  getAllApartamentosByEmpresa,
  getApartamentosInativosByEmpresa,
  getApartamentoByIdAndEmpresa,
  getApartamentosByPredioIdAndEmpresa,
  getVagaSelfieTemGaragem
};
