// authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
const SECURE_LINK_KEY = process.env.SECURE_LINK_KEY; // Defina no .env

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    req.userId = decoded.id;
    req.email = decoded.email;
    next();
  });
};
const verifySecureLink = (req, res, next) => {
  const { secureToken } = req.params; // Vem da URL
  if (!secureToken || secureToken !== SECURE_LINK_KEY) {
    return res.status(403).json({ message: "Acesso negado. Token inválido!" });
  }
  next();
};

module.exports ={
  verifyToken,
  verifySecureLink
} 