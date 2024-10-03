const express = require('express');
const cors = require('cors');

const router = require('./router');
const app = express();

app.use(cors());
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });
  
app.use(express.json());

app.use(router);

module.exports = app;
