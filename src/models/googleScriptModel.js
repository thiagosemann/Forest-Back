const axios = require('axios');

// Defina a URL do Google Script em uma variável
const urlGoogleScript = 'https://script.google.com/macros/s/AKfycbx3oQsSWQ569RaDTpp7OOPRfQwOP2t70K57RjZKOHLhkafvBqIZwBV-0SvhwfgC7c4FmQ/exec';

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
