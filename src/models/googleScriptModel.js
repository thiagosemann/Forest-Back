const axios = require('axios');
require('dotenv').config();

// Defina a URL do Google Script em uma variável
const urlGoogleScript = 'https://script.google.com/macros/s/AKfycbzUqeLuyg5ZtSyNkMwI7mKlZJOi__mGkc5erb-35DWRPxiwaMtJGA3Wvf6nfQNwvt8Wyw/exec';

async function enviarDadosParaGoogleScript(dados) {
  try {
    const response = await axios.post(urlGoogleScript, { type: 'dados', data: { dados } }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data; // Retorna a resposta do Google Apps Script
  } catch (error) {
    console.error('Erro ao enviar dados para o Google Script:', error);
    throw new Error('Erro ao enviar dados para o Google Script');
  }
}

async function enviarImagemParaGoogleScript(dados) {
  try {
    const response = await axios.post(urlGoogleScript, { type: 'image', data: { dados } }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data; // Retorna a resposta do Google Apps Script
  } catch (error) {
    console.error('Erro ao enviar imagem para o Google Script:', error);
    throw new Error('Erro ao enviar imagem para o Google Script');
  }
}

async function enviarPDFParaGoogleScript(dados) {
  try {
    const response = await axios.post(urlGoogleScript, { type: 'pdf', data: { dados } }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data; // Retorna a resposta do Google Apps Script
  } catch (error) {
    console.error('Erro ao enviar PDF para o Google Script:', error);
    throw new Error('Erro ao enviar PDF para o Google Script');
  }
}

module.exports = {
  enviarDadosParaGoogleScript,
  enviarImagemParaGoogleScript,
  enviarPDFParaGoogleScript
};
