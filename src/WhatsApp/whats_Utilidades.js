/* ===== whats_utilidades.js ===== */
const { W_API_BASE_URL, W_API_INSTANCE_ID, W_API_TOKEN } = process.env;

const W_API_URL_TEXT = `${W_API_BASE_URL}/v1/message/send-text?instanceId=${W_API_INSTANCE_ID}`;
const W_API_URL_MEDIA = `${W_API_BASE_URL}/v1/message/send-image?instanceId=${W_API_INSTANCE_ID}`;

const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${W_API_TOKEN}`,
};

function formatarData(data) {
  const dataObj = new Date(data);
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = dataObj.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function formatarCPF(cpf) {
  if(!cfp){
    return ""
  }
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

function formatarTelefone(telefone) {
    if(!telefone){
    return ""
  }
  return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}

module.exports = {
  W_API_URL_TEXT,
  W_API_URL_MEDIA,
  HEADERS,
  formatarData,
  formatarCPF,
  formatarTelefone,
};
