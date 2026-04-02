const { scrapeAirbnbApartamento, scrapeAirbnbByUrl } = require('../../Scripts/scrapper');

// GET /scrapper/apartamento/:id
// Busca o link_anuncio_airbnb do apartamento no banco e faz o scrape
const scrapeByApartamentoId = async (req, res) => {
  const { id } = req.params;
  try {
    const info = await scrapeAirbnbApartamento(Number(id));
    return res.status(200).json(info);
  } catch (error) {
    console.error('Erro no scraper por ID:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// POST /scrapper/link
// Body: { url: "https://www.airbnb.com.br/rooms/..." }
const scrapeByUrl = async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Campo "url" é obrigatório.' });
  try {
    const info = await scrapeAirbnbByUrl(url);
    return res.status(200).json(info);
  } catch (error) {
    console.error('Erro no scraper por URL:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { scrapeByApartamentoId, scrapeByUrl };
