const express = require('express');
const router = express.Router();
const verifyToken = require('./src/middlewares/authMiddleware');

const usersController = require('./src/controllers/usersController');
const buildingsController = require('./src/controllers/buildingsController');
const commonExpensesController = require('./src/controllers/gastosComunController');
const expenseTypesController = require('./src/controllers/tipoGastosController');
const apartamentosController = require('./src/controllers/apartamentoController');
const individualExpensesController = require('./src/controllers/gastosIndividuaisController');
const vagasController = require('./src/controllers/vagasController');
const statusController = require('./src/controllers/statusController');
const provisaoController = require('./src/controllers/provisaoController');

// User routes
router.get('/users', verifyToken, usersController.getAllUsers);
router.get('/users/:id', verifyToken, usersController.getUser);
router.post('/login', usersController.loginUser);
router.post('/users', usersController.createUser);
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
router.get('/commonexpenses/provisoes/:predio_id', verifyToken, commonExpensesController.getProvisoesByBuilding);


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

// Individual expenses routes
router.post('/individualexpenses', verifyToken, individualExpensesController.createIndividualExpenses);
router.put('/individualexpenses/:id', verifyToken, individualExpensesController.updateIndividualExpense);
router.delete('/individualexpenses/:id', verifyToken, individualExpensesController.deleteIndividualExpense);
router.get('/individualexpenses/apartment/:apt_id', verifyToken, individualExpensesController.getExpensesByApartment);
router.get('/individualexpenses/predios/:predio_id/month/:month/year/:year', verifyToken, individualExpensesController.getIndividualExpensesByAptMonthAndYear);
router.get('/individualexpenses', verifyToken, individualExpensesController.getAllIndividualExpenses);
router.get('/individualexpenses/:id', verifyToken, individualExpensesController.getIndividualExpense);
router.delete('/individualexpenses/predios/:predio_id/month/:month/year/:year', verifyToken, individualExpensesController.deleteIndividualExpensesByAptMonthAndYear);

// Vagas routes
router.get('/vagas', verifyToken, vagasController.getAllVagas);
router.get('/vagas/:id', verifyToken, vagasController.getVagaById);
router.post('/vagas', verifyToken, vagasController.createVaga);
router.get('/vagas/predios/:predioId', verifyToken, vagasController.getVagasByBuildingId);
router.get('/vagas/apartamentos/:apartamentoId', verifyToken, vagasController.getVagasByApartamentId);
router.put('/vagas/:id', verifyToken, vagasController.updateVaga);
router.delete('/vagas/:id', verifyToken, vagasController.deleteVaga);

// Provisões routes
router.get('/provisoes', verifyToken, provisaoController.getAllProvisoes);
router.get('/provisoes/:id', verifyToken, provisaoController.getProvisaoById);
router.post('/provisoes', verifyToken, provisaoController.createProvisao);
router.put('/provisoes/:id', verifyToken, provisaoController.updateProvisao);
router.delete('/provisoes/:id', verifyToken, provisaoController.deleteProvisao);
router.get('/provisoes/predios/:predioId', verifyToken, provisaoController.getProvisoesByBuildingId);

// Definir a rota para o status do servidor
router.get('/status', statusController.getServerStatus);



module.exports = router;



