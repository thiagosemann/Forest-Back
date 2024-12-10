const express = require('express');
const cors = require('cors');
const router = require('./router');
const app = express();

// Definindo o limite para 10MB (ajuste conforme necessário)
app.use(express.json({ limit: '10mb' }));  // Aumenta o limite do corpo da requisição

app.use(cors());

// Configuração para evitar cache
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

app.use(router);

module.exports = app;
