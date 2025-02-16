const express = require('express');
const cors = require('cors');
const router = require('./router');
const app = express();

// Configuração do CORS com opções específicas
app.use(cors({
  origin: 'https://airbnb-front-alpha.vercel.app', // Permitir apenas o frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
  credentials: true // Se estiver usando cookies/tokens de autenticação
}));

// Aumentar limite do payload
app.use(express.json({ limit: '10mb' }));

// Configuração para evitar cache
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Tratamento explícito para requisições OPTIONS
app.options('*', (req, res) => {
    res.sendStatus(200);
});

// Se tiver uma rota específica para login, adicione também:
app.options('/login-airbnb', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'https://airbnb-front-alpha.vercel.app');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

app.use(router);

module.exports = app;