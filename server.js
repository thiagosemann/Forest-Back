require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const app = require('./app');

const PORT = process.env.PORT || 21055;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('Server running on', HOST + ':' + PORT);
});

//Teste