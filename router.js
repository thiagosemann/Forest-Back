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
const fundosController = require('./src/controllers/fundoController');
const calculateRateioController = require('./src/controllers/calculateRateioController');
const saldoFundosController = require('./src/controllers/saldoFundosController');
const airbnbCalendarController = require('./src/controllers/calendarioAirBnbController'); // Importando o controlador
const googleScriptController = require('./src/controllers/googleScriptController');
const rateiosPorApartamentoController = require('./src/controllers/rateiosPorApartamentoController');
const rateiosController = require('./src/controllers/rateiosController');
const saldosController = require('./src/controllers/saldoPorPredioController');
const notasGastoComunsController = require('./src/controllers/notasGastosComunsController');


// User routes
router.get('/users', verifyToken, usersController.getAllUsers); // Listar todos os usuários
router.get('/users/:id', verifyToken, usersController.getUser); // Obter um usuário por ID
router.post('/login', usersController.loginUser); // Login de usuário
router.post('/users', usersController.createUser); // Criar um novo usuário
router.post('/users/batch', verifyToken, usersController.createUsersBatch); // Inserção de usuários em lote
router.put('/users/:id', verifyToken, usersController.updateUser); // Atualizar usuário por ID
router.get('/users/building/:building_id', verifyToken, usersController.getUsersByBuilding); // Obter usuários por prédio
router.delete('/users/:id', verifyToken, usersController.deleteUser); // Excluir usuário por ID


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
router.post('/apartamentos/batch', verifyToken, apartamentosController.createApartamentosBatch); // Inserção de usuários em lote
router.get('/apartamentos/predios/:id', verifyToken, apartamentosController.getApartamentosByBuildingId);
router.put('/apartamentos/:id', verifyToken, apartamentosController.updateApartamento); // Rota para atualizar apartamento
router.delete('/apartamentos/:id', verifyToken, apartamentosController.deleteApartamento); // Rota para deletar apartamento


// Individual expenses routes
router.post('/individualexpenses', verifyToken, individualExpensesController.createIndividualExpenses);
router.put('/individualexpenses/:id', verifyToken, individualExpensesController.updateIndividualExpense);
router.delete('/individualexpenses/:id', verifyToken, individualExpensesController.deleteIndividualExpense);
router.get('/individualexpenses/apartment/:apt_id', verifyToken, individualExpensesController.getExpensesByApartment);
router.get('/individualexpenses/predios/:predio_id/month/:month/year/:year', verifyToken, individualExpensesController.getIndividualExpensesByAptMonthAndYear);
router.get('/individualexpenses', verifyToken, individualExpensesController.getAllIndividualExpenses);
router.get('/individualexpenses/:id', verifyToken, individualExpensesController.getIndividualExpense);
router.delete('/individualexpenses/batch', verifyToken, individualExpensesController.deleteIndividualExpensesInBatch);


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

// Fundos routes
router.get('/fundos', verifyToken, fundosController.getAllFundos);
router.get('/fundos/:id', verifyToken, fundosController.getFundoById);
router.post('/fundos', verifyToken, fundosController.createFundo);
router.put('/fundos/:id', verifyToken, fundosController.updateFundo);
router.delete('/fundos/:id', verifyToken, fundosController.deleteFundo);
router.get('/fundos/predios/:predioId', verifyToken, fundosController.getFundosByBuildingId);

// Rateio routes
router.get('/calculateRateio/predios/:predio_id/month/:month/year/:year', verifyToken, calculateRateioController.getRateioByBuildingMonthAndYear);


// Rotas para saldo de fundos
router.get('/saldofundos', verifyToken, saldoFundosController.getAllSaldoFundos); 
router.get('/saldofundos/predios/:predioId', verifyToken, saldoFundosController.getSaldoFundosByBuildingId);

router.get('/saldofundos/:id', verifyToken, saldoFundosController.getSaldoFundoById); 
router.post('/saldofundos', verifyToken, saldoFundosController.createSaldoFundo); 
router.put('/saldofundos/:id', verifyToken, saldoFundosController.updateSaldoFundo); 
router.delete('/saldofundos/:id', verifyToken, saldoFundosController.deleteSaldoFundo); 


// Definir a rota para o status do servidor
router.get('/status', statusController.getServerStatus);

// Rota para obter o calendário da Airbnb sem validação de token
router.get('/airbnb-calendar', airbnbCalendarController.fetchAirbnbCalendar);

// Rota para enviar dados ao Google Script
router.post('/enviar-dados', googleScriptController.enviarDadosParaGoogleScript);
router.post('/enviar-imagem', googleScriptController.enviarImagemParaGoogleScript);
router.post('/enviar-pdf', googleScriptController.enviarPDFParaGoogleScript);

// Rotas para Rateios
router.get('/rateios', verifyToken, rateiosController.getAllRateios);
router.get('/rateios/predios/:predioId/:mes/:ano', verifyToken, rateiosController.getRateiosByBuildingIdAndMonthAndYear);
router.get('/rateios/:id', verifyToken, rateiosController.getRateioById);
router.post('/rateios', verifyToken, rateiosController.createRateio);
router.put('/rateios/:id', verifyToken, rateiosController.updateRateio);
router.delete('/rateios/:id', verifyToken, rateiosController.deleteRateio);

// Rotas para RateiosPorApartamento
router.get('/rateiosPorApartamento', verifyToken, rateiosPorApartamentoController.getAllRateiosPorApartamento);
router.get('/rateiosPorApartamento/apartamento/:apartamentoId', verifyToken, rateiosPorApartamentoController.getRateioPorApartamentoByAptId);
router.get('/rateiosPorApartamento/rateio/:rateioId', verifyToken, rateiosPorApartamentoController.getRateiosPorApartamentoByRateioId);
router.get('/rateiosPorApartamento/:id', verifyToken, rateiosPorApartamentoController.getRateioPorApartamentoById);
router.get('/rateiosPorApartamento/inadimplentes/predio/:predioId', verifyToken, rateiosPorApartamentoController.getRateiosNaoPagosPorPredioId);
router.post('/rateiosPorApartamento', verifyToken, rateiosPorApartamentoController.createRateioPorApartamento);
router.post('/rateiosPorApartamento/atualizar-data-pagamento', verifyToken, rateiosPorApartamentoController.atualizarDataPagamento);
router.put('/rateiosPorApartamento/:id/update-data-pagamento', verifyToken, rateiosPorApartamentoController.updateDataPagamento);
router.put('/rateiosPorApartamento/:id', verifyToken, rateiosPorApartamentoController.updateRateioPorApartamento);
router.delete('/rateiosPorApartamento/:id', verifyToken, rateiosPorApartamentoController.deleteRateioPorApartamento);

// Rotas para saldos_por_predio
router.get('/saldos', verifyToken, saldosController.getAllSaldos);
router.get('/saldos/:id', verifyToken, saldosController.getSaldoById);
router.post('/saldos', verifyToken, saldosController.createSaldo);
router.put('/saldos/:id', verifyToken, saldosController.updateSaldo);
router.delete('/saldos/:id', verifyToken, saldosController.deleteSaldo);
router.get('/saldos/predios/:predioId', verifyToken, saldosController.getSaldosByBuildingId);

// Rotas para documentos de gastos comuns
router.get('/notasGastoComuns', verifyToken, notasGastoComunsController.getAllNotasGastosComuns);
router.get('/notasGastoComuns/:id', verifyToken, notasGastoComunsController.getNotasGastosComunsById);
router.post('/notasGastoComuns', verifyToken, notasGastoComunsController.createNotasGastosComuns);
router.put('/notasGastoComuns/:id', verifyToken, notasGastoComunsController.updateNotasGastosComuns);
router.delete('/notasGastoComuns/:id', verifyToken, notasGastoComunsController.deleteNotasGastosComuns);
router.get('/notasGastoComuns/common-expense/:commonExpenseId', verifyToken, notasGastoComunsController.getNotasGastosComunsByCommonExpenseId);
router.get('/notasGastoComuns/building/:predio_id/month/:month/year/:year', verifyToken, notasGastoComunsController.getNotasGastosComunsByBuildingAndMonth);



module.exports = router;



