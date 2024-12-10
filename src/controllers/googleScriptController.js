const googleScriptModel = require('../models/googleScriptModel');

// Função para enviar dados ao Google Script
const enviarDadosParaGoogleScript = async (request, response) => {
  try {
    const { cod_reserva, CPF, Nome, Telefone, imagemBase64 } = request.body;

    // Verificando se todos os campos necessários foram enviados
    if (!cod_reserva || !CPF || !Nome || !Telefone || !imagemBase64) {
      return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Organizando os dados que serão enviados ao Google Script
    const dados = {
      cod_reserva,
      CPF,
      Nome,
      Telefone,
      imagemBase64
    };

    // Enviando os dados para o Google Script usando o modelo
    const resultado = await googleScriptModel.enviarDadosParaGoogleScript(dados);

    // Retornando a resposta do Google Script ao frontend
    return response.status(200).json({
      message: 'Dados enviados com sucesso',
      resultado
    });
  } catch (error) {
    console.error('Erro ao enviar dados ao Google Script:', error);
    return response.status(500).json({ error: 'Erro ao enviar dados ao Google Script' });
  }
};

module.exports = {
  enviarDadosParaGoogleScript
};
