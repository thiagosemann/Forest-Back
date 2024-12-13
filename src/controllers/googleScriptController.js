const googleScriptModel = require('../models/googleScriptModel');

// Função para enviar dados ao Google Script
const enviarDadosParaGoogleScript = async (request, response) => {
  try {
    const { cod_reserva, CPF, Nome, Telefone } = request.body;

    // Verificando se todos os campos necessários foram enviados
    if (!cod_reserva || !CPF || !Nome || !Telefone) {
      return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Organizando os dados que serão enviados ao Google Script
    const dados = { cod_reserva, CPF, Nome, Telefone };
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

// Função para enviar imagem ao Google Script
const enviarImagemParaGoogleScript = async (request, response) => {
  try {
    const { cod_reserva, CPF,imagemBase64 } = request.body;

    // Verificando se o campo imagemBase64 foi enviado
    if (!cod_reserva || !CPF || !imagemBase64) {
      return response.status(400).json({ error: 'O campo imagemBase64 é obrigatório' });
    }
    const dados = { cod_reserva, CPF, imagemBase64 };

    // Enviando a imagem para o Google Script usando o modelo
    const resultado = await googleScriptModel.enviarImagemParaGoogleScript(dados);

    // Retornando a resposta do Google Script ao frontend
    return response.status(200).json({
      message: 'Imagem enviada com sucesso',
      resultado
    });
  } catch (error) {
    console.error('Erro ao enviar imagem ao Google Script:', error);
    return response.status(500).json({ error: 'Erro ao enviar imagem ao Google Script' });
  }
};

// Função para enviar PDF ao Google Script
const enviarPDFParaGoogleScript = async (request, response) => {
  try {
    const { cod_reserva, CPF,documentBase64 } = request.body;

    // Verificando se o campo documentoBase64 foi enviado
    if (!cod_reserva || !CPF || !documentBase64) {
      return response.status(400).json({ error: 'O campo documentoBase64 é obrigatório' });
    }

    const dados = { cod_reserva, CPF, documentBase64 };

    // Enviando o PDF para o Google Script usando o modelo
    const resultado = await googleScriptModel.enviarPDFParaGoogleScript(dados);

    // Retornando a resposta do Google Script ao frontend
    return response.status(200).json({
      message: 'PDF enviado com sucesso',
      resultado
    });
  } catch (error) {
    console.error('Erro ao enviar PDF ao Google Script:', error);
    return response.status(500).json({ error: 'Erro ao enviar PDF ao Google Script' });
  }
};

module.exports = {
  enviarDadosParaGoogleScript,
  enviarImagemParaGoogleScript,
  enviarPDFParaGoogleScript
};