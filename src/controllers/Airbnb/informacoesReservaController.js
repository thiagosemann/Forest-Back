const informacoesReservaModel = require('../../models/Airbnb/informacoesReservaModel');

const getInformacoesReserva = async (request, response) => {
  try {
    const { CPF, cod_reserva } = request.params;
    const informacoes = await informacoesReservaModel.getInformacoesReserva(CPF, cod_reserva);

    if (!informacoes) {
      return response.status(403).json({
        message: 'Você precisa realizar o check-in nessa reserva para acessar as informações.'
      });
    }

    return response.status(200).json(informacoes);
  } catch (error) {
    console.error('Erro ao buscar informações da reserva:', error);
    return response.status(500).json({ error: 'Erro interno ao buscar informações da reserva.' });
  }
};

module.exports = { getInformacoesReserva };
