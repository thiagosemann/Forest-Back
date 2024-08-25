
// Função para responder com uma mensagem de servidor online
exports.getServerStatus = (req, res) => {
    res.status(200).json({
      message: 'Servidor online'
    });
};
  