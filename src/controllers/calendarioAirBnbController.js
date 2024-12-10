const { getAirbnbCalendar } = require('../models/calendarioAirBnbModel'); // Importando a função do model

// Controlador para obter o calendário da Airbnb
async function fetchAirbnbCalendar(req, res) {
  try {
    // Chama a função do model para obter os dados do calendário
    const calendarData = await getAirbnbCalendar();
    
    // Retorna os dados do calendário no formato JSON
    res.status(200).json({ data: calendarData });
  } catch (error) {
    // Em caso de erro, retorna uma mensagem de erro com status 500
    res.status(500).json({ error: error.message || 'Erro ao acessar o calendário' });
  }
}

// Exportando o controlador
module.exports = {
  fetchAirbnbCalendar,
};
