const express = require('express');
const router = express.Router();
const verifyToken = require('./middlewares/authMiddleware');


const usersController = require('./controllers/usersController');
const buildingsController = require('./controllers/buildingsController');
const commonExpensesController = require('./controllers/gastosComunController');
const expenseTypesController = require('./controllers/tipoGastosController');
const apartamentosController = require('./controllers/apartamentoController');


// User routes
router.get('/users',verifyToken, usersController.getAllUsers);
router.get('/users/:id', verifyToken, usersController.getUser);
router.post('/login', usersController.loginUser);
router.post('/users',usersController.createUser);
router.put('/users/:id', verifyToken, usersController.updateUser); 
router.get('/users/building/:building_id', verifyToken, usersController.getUsersByBuilding);
router.delete('/users/:id', verifyToken, usersController.deleteUser);


// Building routes
router.get('/buildings', verifyToken, buildingsController.getAllBuildings);
router.get('/buildings/:id', verifyToken, buildingsController.getBuilding);
router.post('/buildings', verifyToken, buildingsController.createBuilding);
router.put('/buildings/:id', verifyToken, buildingsController.updateBuilding);
router.delete('/buildings/:id', verifyToken, buildingsController.deleteBuilding);


// Common expenses routes
router.get('/commonexpenses', verifyToken, commonExpensesController.getAllCommonExpenses);
router.get('/commonexpenses/:id', verifyToken, commonExpensesController.getCommonExpense);
router.post('/commonexpenses', verifyToken, commonExpensesController.createCommonExpense);
router.put('/commonexpenses/:id', verifyToken, commonExpensesController.updateCommonExpense);
router.delete('/commonexpenses/:id', verifyToken, commonExpensesController.deleteCommonExpense);
router.get('/commonexpenses/building/:predio_id/month/:month/year/:year', verifyToken, commonExpensesController.getExpensesByBuildingAndMonth);
router.post('/commonexpenses/array', verifyToken, commonExpensesController.createCommonExpenses);


// Expense types routes
router.get('/expensetypes', verifyToken, expenseTypesController.getAllExpenseTypes);
router.get('/expensetypes/:id', verifyToken, expenseTypesController.getExpenseType);
router.post('/expensetypes', verifyToken, expenseTypesController.createExpenseType);
router.put('/expensetypes/:id', verifyToken, expenseTypesController.updateExpenseType);
router.delete('/expensetypes/:id', verifyToken, expenseTypesController.deleteExpenseType);


// Apartamento routes
router.get('/apartamentos', verifyToken, apartamentosController.getAllApartamentos);
router.get('/apartamentos/:id', verifyToken, apartamentosController.getApartamentoById);
router.post('/apartamentos', verifyToken, apartamentosController.createApartamento);
router.get('/apartamentos/predios/:id', verifyToken, apartamentosController.getApartamentosByBuildingId);


module.exports = router;
