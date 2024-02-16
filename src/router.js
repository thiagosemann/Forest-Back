const express = require('express');
const router = express.Router();
const verifyToken = require('./middlewares/authMiddleware');


const usersController = require('./controllers/usersController');


// User routes
router.get('/users',verifyToken, usersController.getAllUsers);
router.get('/users/:id', verifyToken, usersController.getUser);
router.post('/login', usersController.loginUser);
router.post('/users',usersController.createUser);
router.put('/users/:id', verifyToken, usersController.updateUser); 
router.get('/users/building/:building_id', verifyToken, usersController.getUsersByBuilding);
router.delete('/users/:id', verifyToken, usersController.deleteUser);



module.exports = router;
