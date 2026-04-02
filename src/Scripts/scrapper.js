const puppeteer = require('puppeteer');
const connection = require('../models/connection2');

// Busca o apartamento pelo ID e retorna o link do anúncio Airbnb
async function getLinkAnuncioAirbnb(apartamentoId) {
  const [rows] = await connection.execute(
    'SELECT * FROM apartamentos WHERE id = ?',
    [apartamentoId]
  );
  if (rows.length === 0) throw new Error(`Apartamento com id ${apartamentoId} não encontrado.`);
  const apartamento = rows[0];
  if (!apartamento.link_anuncio_airbnb)
    throw new Error(`Apartamento id ${apartamentoId} não possui link_anuncio_airbnb.`);
  return apartamento;
}

// Extrai o ID de listing da URL do Airbnb
function extractListingIdFromUrl(url) {
  const match = url.match(/\/rooms\/(\d+)/);
  return match ? match[1] : null;
}

// Extrai o primeiro match de um padrão JSON embutido no HTML
function extractJsonPattern(html, pattern) {
  const match = html.match(pattern);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

// Extrai comodidades do JSON embutido no HTML (seeAllAmenitiesGroups)
function extractAmenities(html) {
  const match = html.match(/"seeAllAmenitiesGroups":(\[[\s\S]*?\]),"shouldRemoveLimitOfPreviewAmenities"/);
  if (!match) return [];
  try {
    const groups = JSON.parse(match[1]);
    const all = [];
    for (const group of groups) {
      for (const amenity of group.amenities || []) {
        all.push({
          categoria: group.title,
          nome: amenity.title,
          subtitulo: amenity.subtitle || null,
          disponivel: amenity.available,
        });
      }
    }
    return all;
  } catch {
    return [];
  }
}

// Extrai avaliações por categoria do JSON embutido
function extractRatingCategories(html) {
  const validLabels = ['Limpeza', 'Exatidão do anúncio', 'Check-in', 'Comunicação', 'Localização', 'Custo-benefício'];
  const categories = [];
  const regex = /"localizedRating":"([^"]+)","label":"([^"]+)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const nota = m[1];
    const label = m[2];
    if (validLabels.includes(label)) {
      categories.push({ categoria: label, nota });
    }
  }
  return categories;
}

// Usa Puppeteer para carregar a página e retornar o HTML completo renderizado
async function fetchRenderedHtml(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pt-BR'],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'pt-BR,pt;q=0.9' });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    return await page.content();
  } finally {
    await browser.close();
  }
}

// Monta o objeto final com todos os dados extraídos
function buildListingInfo(html, listingUrl) {
  // Dados base via JSON-LD
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const jsonLd = jsonLdMatch ? JSON.parse(jsonLdMatch[1]) : {};
  const rating = jsonLd.aggregateRating || {};
  const images = Array.isArray(jsonLd.image) ? jsonLd.image : jsonLd.image ? [jsonLd.image] : [];

  // Tipo do imóvel e capacidade do JSON embutido
  const roomType = extractJsonPattern(html, /"roomType":"([^"]+)"/)
  const personCapacity = extractJsonPattern(html, /"personCapacity":(\d+)/);

  // Overview (hóspedes, quartos, camas, banheiros) via DOM já renderizado
  const overviewMatch = html.match(/class="lgx66tx[^"]*"[^>]*>([\s\S]*?)<\/ol>/);
  const overviewItems = [];
  if (overviewMatch) {
    const liRegex = /<li[^>]*>(.*?)<span class="axjq0r/g;
    let m;
    while ((m = liRegex.exec(overviewMatch[1])) !== null) {
      const text = m[1].replace(/<[^>]+>/g, '').trim();
      if (text) overviewItems.push(text);
    }
  }

  return {
    id_listing: extractListingIdFromUrl(listingUrl),
    titulo: jsonLd.name || null,
    descricao: jsonLd.description || null,
    tipo_imovel: roomType || null,
    nota_geral: rating.ratingValue ? parseFloat(rating.ratingValue) : null,
    total_avaliacoes: rating.ratingCount ? parseInt(rating.ratingCount) : null,
    capacidade_hospedes: personCapacity || jsonLd.containsPlace?.occupancy?.value || null,
    detalhes_propriedade: overviewItems,
    latitude: jsonLd.latitude || null,
    longitude: jsonLd.longitude || null,
    cidade: jsonLd.address?.addressLocality || null,
    estado: jsonLd.address?.addressRegion || null,
    pais: jsonLd.address?.addressCountry || null,
    imagens: images,
    comodidades: extractAmenities(html),
    avaliacoes_categorias: extractRatingCategories(html),
    url_anuncio: listingUrl,
  };
}

// Função principal
async function scrapeAirbnbApartamento(apartamentoId) {
  console.log(`\n=== Scraper Airbnb | Apartamento ID: ${apartamentoId} ===\n`);

  const apartamento = await getLinkAnuncioAirbnb(apartamentoId);
  const listingUrl = apartamento.link_anuncio_airbnb;
  console.log(`Link encontrado: ${listingUrl}\n`);

  console.log('Carregando página com Puppeteer...');
  const html = await fetchRenderedHtml(listingUrl);

  const info = buildListingInfo(html, listingUrl);

  console.log(`Comodidades extraídas: ${info.comodidades.length}`);
  console.log(`Avaliações por categoria: ${info.avaliacoes_categorias.length}`);
  console.log('\n=== Informações do Anúncio ===');
  console.log(JSON.stringify(info, null, 2));
  return info;
}

// Scrape direto por URL (sem buscar no banco)
async function scrapeAirbnbByUrl(url) {
  console.log(`\nCarregando página com Puppeteer: ${url}\n`);
  const html = await fetchRenderedHtml(url);
  return buildListingInfo(html, url);
}

module.exports = { scrapeAirbnbApartamento, scrapeAirbnbByUrl };
