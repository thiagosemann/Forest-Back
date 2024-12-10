const axios = require('axios');

async function enviarDadosParaGoogleScript(dados) {
  try {
    const urlGoogleScript = 'https://script.google.com/macros/s/AKfycbz55PC9Ns0fyiIt3WtEuc247H1doa2CoT2gABhPpAdHarcT_bUHKmeHz4CDJsjGdJD1lw/exec'; // Substitua pela URL do seu Google Apps Script

    const response = await axios.post(urlGoogleScript, dados, {
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

module.exports = {
  enviarDadosParaGoogleScript
};
