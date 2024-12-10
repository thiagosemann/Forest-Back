const axios = require('axios');
const ical = require('ical.js');  // Biblioteca para analisar o ICS

async function getAirbnbCalendar() {
  try {
    // URLs dos arquivos ical da Airbnb com os nomes dos apartamentos associados
    const apartmentMap = new Map([
      [
        'https://www.airbnb.com/calendar/ical/45528337.ics?s=6e3d033213a65bdbf6ad95a7785f7b38',
        'CPR23'
      ],
      [
        'https://www.airbnb.com/calendar/ical/45548845.ics?s=8b5abf47a402d10ea0687fc954f990c2',
        'BOT02'
      ]
    ]);

    // Array para armazenar os eventos de cada URL
    const calendars = [];

    // Iterando pelas chaves do Map (as URLs)
    for (let [icalUrl, apartmentName] of apartmentMap) {
      const response = await axios.get(icalUrl);

      // Verificando o status da resposta
      if (response.status !== 200) {
        console.error('Erro ao buscar o arquivo ICS:', response.status);
        continue;
      }

      // Analisando o conteúdo ICS
      const jcalData = new ical.parse(response.data);
      const comp = new ical.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

      // Extraindo eventos
      const events = vevents.map((vevent) => {
        const event = {
          summary: vevent.getFirstPropertyValue('summary'),
          startDate: vevent.getFirstPropertyValue('dtstart'),
          endDate: vevent.getFirstPropertyValue('dtend'),
          description: vevent.getFirstPropertyValue('description'),
          uid: vevent.getFirstPropertyValue('uid')
        };

        return event;
      });

      // Adicionando os eventos ao array final com o nome do apartamento
      calendars.push({
        apartmentName: apartmentName,  // Usando o nome do apartamento do Map
        events: events
      });
    }

    console.log('Calendários:', JSON.stringify(calendars, null, 2));
    return calendars;
  } catch (error) {
    console.error('Erro ao obter o calendário do Airbnb:', error);
  }
}

module.exports = {
  getAirbnbCalendar,
};
