const express = require('express');
const router = express.Router();
const verifyToken = require('./src/middlewares/authMiddleware');

const usersController = require('./src/controllers/Admnistracao/usersController');
const buildingsController = require('./src/controllers/Admnistracao/buildingsController');
const commonExpensesController = require('./src/controllers/Admnistracao/gastosComunController');
const expenseTypesController = require('./src/controllers/Admnistracao/tipoGastosController');
const apartamentosController = require('./src/controllers/Admnistracao/apartamentoController');
const individualExpensesController = require('./src/controllers/Admnistracao/gastosIndividuaisController');
const vagasController = require('./src/controllers/Admnistracao/vagasController');
const statusController = require('./src/controllers/Admnistracao/statusController');
const provisaoController = require('./src/controllers/Admnistracao/provisaoController');
const fundosController = require('./src/controllers/Admnistracao/fundoController');
const calculateRateioController = require('./src/controllers/Admnistracao/calculateRateioController');
const saldoFundosController = require('./src/controllers/Admnistracao/saldoFundosController');
const googleScriptController = require('./src/controllers/Admnistracao/googleScriptController');
const rateiosPorApartamentoController = require('./src/controllers/Admnistracao/rateiosPorApartamentoController');
const rateiosController = require('./src/controllers/Admnistracao/rateiosController');
const saldosController = require('./src/controllers/Admnistracao/saldoPorPredioController');
const notasGastoComunsController = require('./src/controllers/Admnistracao/notasGastosComunsController');
const extratoPdfController = require('./src/controllers/Admnistracao/extratoPdfController');
const usersApartamentosController = require('./src/controllers/Admnistracao/usersApartamentosController');
const rateioBoletoEmailController = require('./src/controllers/Admnistracao/rateiosBoletosEmailController');
const prestacaoCobrancaBoletosController = require('./src/controllers/Admnistracao/prestacaoCobrancaBoletosController');


//-----------------------Controller Airbnb--------------------------------
const usersAirbnbController = require('./src/controllers/Airbnb/usersAirbnbController');
const predioAirbnbController = require('./src/controllers/Airbnb/predioAirbnbController');
const apartamentosAirbnbController = require('./src/controllers/Airbnb/apartamentosAirbnbController');
const reservasAirbnbController = require('./src/controllers/Airbnb/reservasAirbnbController');
const checkinFormController = require('./src/controllers/Airbnb/checkinFormController'); // Import do checkinController
const vistoriaController = require('./src/controllers/Airbnb/vistoriaController'); // Import do vistoriaController
const portariasController = require('./src/controllers/Airbnb/portariasAirbnbController'); // Import do vistoriaController
const predioPortariaController = require('./src/controllers/Airbnb/predioPortariaController');
const mensagemAutomatica    =require('./src/mensagemAutomatica')
const limpezaExtraController = require('./src/controllers/Airbnb/limpezaExtraAirbnbController');
const pagamentosController = require('./src/controllers/Airbnb/pagamento_por_reservaController');
const mercadoPagoApi = require('./src/mercadoPago');
const ticketReembolsoController = require('./src/controllers/Airbnb/ticketReembolsoController');


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
router.delete('/individualexpenses/batch', verifyToken, individualExpensesController.deleteIndividualExpensesInBatch);

router.put('/individualexpenses/:id', verifyToken, individualExpensesController.updateIndividualExpense);
router.delete('/individualexpenses/:id', verifyToken, individualExpensesController.deleteIndividualExpense);
router.get('/individualexpenses/apartment/:apt_id', verifyToken, individualExpensesController.getExpensesByApartment);
router.get('/individualexpenses/apartmentByMonth/:id/month/:month/year/:year', verifyToken, individualExpensesController.getIndividualExpensesByAptIdMonthAndYear);
router.get('/individualexpenses/predios/:predio_id/month/:month/year/:year', verifyToken, individualExpensesController.getIndividualExpensesByPredioIdMonthAndYear);
router.get('/individualexpenses', verifyToken, individualExpensesController.getAllIndividualExpenses);
router.get('/individualexpenses/:id', verifyToken, individualExpensesController.getIndividualExpense);


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
router.get('/rateiosPorApartamento/inadimplentes/predio/:predioId/:mes/:ano', verifyToken, rateiosPorApartamentoController.getRateiosNaoPagosPorPredioId);
router.post('/rateiosPorApartamento', verifyToken, rateiosPorApartamentoController.createRateioPorApartamento);
router.put('/rateiosPorApartamento/atualizar-datas-pagamento', verifyToken, rateiosPorApartamentoController.atualizarDataPagamentoEValor);
router.put('/rateiosPorApartamento/:id/update-data-pagamento', verifyToken, rateiosPorApartamentoController.updateDataPagamento);
router.put('/rateiosPorApartamento/:id', verifyToken, rateiosPorApartamentoController.updateRateioPorApartamento);
router.delete('/rateiosPorApartamento/:id', verifyToken, rateiosPorApartamentoController.deleteRateioPorApartamento);
router.get('/rateiosPorApartamento/gerados-pagos/:predioId/:mes/:ano', verifyToken, rateiosPorApartamentoController.getRateiosGeradosEPagosNoMesCorreto);
router.get('/rateiosPorApartamento/pagos-diferentes/:predioId/:mes/:ano', verifyToken, rateiosPorApartamentoController.getRateiosPagosGeradosEmMesesDiferentes);
router.get('/rateiosPorApartamento/rateiosPdfNames/:rateioId', verifyToken, rateiosPorApartamentoController.getRateiosEPdfsNames);

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

// Exemplo com Express Router
router.get('/extratos-pdf', extratoPdfController.getAllExtratosPdf);
router.post('/extratos-pdf', extratoPdfController.createExtratoPdf);
router.delete('/extratos-pdf/:id', verifyToken, extratoPdfController.deleteExtratoPdf);
router.get('/extratos-pdf/:id', verifyToken, extratoPdfController.getExtratoPdfById);
router.get('/extratos-pdf/predio/:predio_id/month/:month/year/:year', extratoPdfController.getExtratosPdfByBuildingMonthYear);


// Cria uma relação entre usuário e apartamento
router.post('/users-apartamentos', verifyToken, usersApartamentosController.createUserApartamento);
router.get('/users-apartamentos', verifyToken, usersApartamentosController.getAllUserApartamentos);
router.get('/users-apartamentos/user/:userId', verifyToken, usersApartamentosController.getApartamentosByUserId);
router.get('/users-apartamentos/apartamento/:apartamentoId', verifyToken, usersApartamentosController.getUsersByApartamentoId);
router.delete('/users-apartamentos/:user_id/:apartamento_id', verifyToken, usersApartamentosController.deleteUserApartamento);

// Rotas para Rateio Boleto Email
router.get('/rateioBoletoEmails', verifyToken, rateioBoletoEmailController.getAllRateioBoletoEmails);
router.post('/rateioBoletoEmails', verifyToken, rateioBoletoEmailController.createRateioBoletoEmail);
router.get('/rateioBoletoEmails/:id', verifyToken, rateioBoletoEmailController.getRateioBoletoEmailById); 
router.put('/rateioBoletoEmails/:id', verifyToken, rateioBoletoEmailController.updateRateioBoletoEmail);   
router.delete('/rateioBoletoEmails/:id',verifyToken,rateioBoletoEmailController.deleteRateioBoletoEmail);

// Rotas para boletos de prestação de cobrança
router.get('/prestacaoCobrancaBoletos', verifyToken, prestacaoCobrancaBoletosController.getAllPrestacaoCobrancaBoletos);
router.get('/prestacaoCobrancaBoletos/:id', verifyToken, prestacaoCobrancaBoletosController.getPrestacaoCobrancaBoletoById);
router.post('/prestacaoCobrancaBoletos', verifyToken, prestacaoCobrancaBoletosController.createPrestacaoCobrancaBoletos);
router.put('/prestacaoCobrancaBoletos/:id', verifyToken, prestacaoCobrancaBoletosController.updatePrestacaoCobrancaBoleto);
router.delete('/prestacaoCobrancaBoletos/:id', verifyToken, prestacaoCobrancaBoletosController.deletePrestacaoCobrancaBoleto);
router.get('/prestacaoCobrancaBoletos/building/:predio_id/month/:month/year/:year', verifyToken, prestacaoCobrancaBoletosController.getPrestacaoCobrancaBoletosByBuildingAndMonth);


//------------------------------Rotas Airbnb----------------------------------------------------------------------------------//

// User routes
router.get('/users-airbnb', verifyToken, usersAirbnbController.getAllUsers);
router.put('/users-airbnb/:id', verifyToken, usersAirbnbController.updateUser);
router.get('/users-airbnb/:id', verifyToken, usersAirbnbController.getUser);
router.get('/users-airbnb/role/:role', verifyToken, usersAirbnbController.getUsersByRole);
router.post('/login-airbnb', usersAirbnbController.loginUser);
router.post('/users-airbnb', usersAirbnbController.createUser);
router.post('/users-airbnb/batch', verifyToken, usersAirbnbController.createUsersBatch);
router.delete('/users-airbnb/:id', verifyToken, usersAirbnbController.deleteUser);

// PredioAirbnb routes
router.get('/predios-airbnb', verifyToken, predioAirbnbController.getAllPredios);
router.get('/predios-airbnb/:id', verifyToken, predioAirbnbController.getPredioById);
router.post('/predios-airbnb', verifyToken, predioAirbnbController.createPredio);
router.put('/predios-airbnb/:id', verifyToken, predioAirbnbController.updatePredio);
router.delete('/predios-airbnb/:id', verifyToken, predioAirbnbController.deletePredio);

// ApartamentosAirbnb routes
router.get('/apartamentos-airbnb', verifyToken, apartamentosAirbnbController.getAllApartamentos);
router.get('/apartamentos-airbnb/:id', verifyToken, apartamentosAirbnbController.getApartamentoById);
router.post('/apartamentos-airbnb', verifyToken, apartamentosAirbnbController.createApartamento);
router.get('/apartamentos-airbnb/predios/:predioId', verifyToken, apartamentosAirbnbController.getApartamentosByPredioId);
router.put('/apartamentos-airbnb/:id', verifyToken, apartamentosAirbnbController.updateApartamento);
router.delete('/apartamentos-airbnb/:id', verifyToken, apartamentosAirbnbController.deleteApartamento);

// ReservasAirbnb routes
router.get('/reservas-airbnb', reservasAirbnbController.getAllReservas);
router.get('/reservas-airbnb/:id', reservasAirbnbController.getReservaById);
router.post('/reservas-airbnb', reservasAirbnbController.createReserva);
router.get('/reservas-airbnb/cancelados/hoje', reservasAirbnbController.getReservasCanceladasHoje);

router.get('/reservas-airbnb/apartamentos/:apartamentoId', reservasAirbnbController.getReservasByApartamentoId);
router.put('/reservas-airbnb/:id', reservasAirbnbController.updateReserva);
router.delete('/reservas-airbnb/:id', reservasAirbnbController.deleteReserva);
// Filtros de reservas
router.get('/reservas-airbnb/reservas/por-periodo', reservasAirbnbController.getReservasPorPeriodo);
// Novos filtros de faxina
router.get('/reservas-airbnb/faxinas/por-periodo', reservasAirbnbController.getFaxinasPorPeriodo);
// Novos filtros calendario
router.get('/reservas-airbnb/reservas/por-periodo-calendario', reservasAirbnbController.getReservasPorPeriodoCalendario);


// Rotas de Check-in
router.get('/checkins', verifyToken, checkinFormController.getAllCheckins); // Listar todos os check-ins
router.get('/checkins/:id', verifyToken, checkinFormController.getCheckinById); // Obter um check-in por ID
router.get('/checkins/reserva/:reservaId', verifyToken, checkinFormController.getCheckinsByReservaId); // Obter check-ins por reservaId
router.get('/checkins/search/:reservaId/:codReserva', verifyToken, checkinFormController.getCheckinByReservaIdOrCodReserva); // Obter check-in por reservaId ou codReserva
router.post('/checkins', checkinFormController.createCheckin); // Criar um novo check-in
router.put('/checkins/:id', verifyToken, checkinFormController.updateCheckin); // Atualizar um check-in por ID
router.delete('/checkins/:id', verifyToken, checkinFormController.deleteCheckin); // Deletar um check-in por ID
router.get('/checkins/user/:userId',verifyToken,checkinFormController.getCheckinsByUserId);
router.post( '/checkins/envio', verifyToken, checkinFormController.envioPorCheckins);

// Rotas de Vistorias
router.get('/vistorias', verifyToken, vistoriaController.getAllVistorias);
router.get('/vistorias/:id',verifyToken, vistoriaController.getVistoriaById);
router.post('/vistorias', verifyToken, vistoriaController.createVistoria);
router.put('/vistorias/:id',  verifyToken, vistoriaController.updateVistoria);
router.delete('/vistorias/:id',  verifyToken, vistoriaController.deleteVistoria);

// Rotas de Portarias
router.get('/portarias', verifyToken, portariasController.getAllPortarias);
router.get('/portarias/:id', verifyToken, portariasController.getPortariaById);
router.post('/portarias', verifyToken, portariasController.createPortaria);
router.put('/portarias/:id', verifyToken, portariasController.updatePortaria);
router.delete('/portarias/:id', verifyToken, portariasController.deletePortaria);

// Rotas de Associação Prédio-Portaria
router.get('/predio-portaria', verifyToken, predioPortariaController.getAllPredioPortaria);
router.get('/predio-portaria/predio/:predioId', verifyToken, predioPortariaController.getPortariasByPredio);
router.get('/predio-portaria/portaria/:portariaId', verifyToken, predioPortariaController.getPrediosByPortaria);
router.post('/predio-portaria', verifyToken, predioPortariaController.linkPortariaToPredio);
router.delete('/predio-portaria', verifyToken, predioPortariaController.unlinkPortariaFromPredio);

// Rotas de Limpezas extras

router.get('/limpeza-extra/', limpezaExtraController.getAllLimpezasExtras);
router.get('/limpeza-extra/hoje',           limpezaExtraController.getLimpezasExtrasHoje);
router.get('/limpeza-extra/semana',         limpezaExtraController.getLimpezasExtrasSemana);
router.get('/limpeza-extra/semana-que-vem', limpezaExtraController.getLimpezasExtrasSemanaQueVem);
router.get('/limpeza-extra/por-periodo', limpezaExtraController.getLimpezasExtrasPorPeriodo);

router.get('/limpeza-extra/:id', limpezaExtraController.getLimpezaExtraById);
router.post('/limpeza-extra/', limpezaExtraController.createLimpezaExtra);
router.put('/limpeza-extra/:id', limpezaExtraController.updateLimpezaExtra);
router.delete('/limpeza-extra/:id', limpezaExtraController.deleteLimpezaExtra);

// Rotas de Pagamentos
router.get('/pagamentos', verifyToken, pagamentosController.getAllPagamentos); // Listar todos
router.get('/pagamentos/:id', verifyToken, pagamentosController.getPagamentoById); // Buscar por ID
router.post('/pagamentos', verifyToken, pagamentosController.createPagamento); // Criar
router.put('/pagamentos/:id', verifyToken, pagamentosController.updatePagamento); // Atualizar
router.delete('/pagamentos/:id', verifyToken, pagamentosController.deletePagamento); // Deletar
// Buscar por código de reserva (individual)
router.get('/pagamentos/reserva/:cod_reserva', verifyToken, pagamentosController.getByCodReserva);
// Buscar por lista de códigos de reserva (array no body)
router.post('/pagamentos/reservas/lista', verifyToken, pagamentosController.getByCodReservaList);
// Buscar todos os pagamentos por apartamento_id
router.get('/pagamentos/apartamento/:apartamento_id', verifyToken, pagamentosController.getByApartamentoId);


// MercadoPago routes
router.post('/mercadoPago/processar-webhook', mercadoPagoApi.processarWebhookMercadoPago);
router.post('/mercadopago/preference',  verifyToken, mercadoPagoApi.criarPreferencia);

// Rotas para Ticket de Reembolso
router.get('/ticket-reembolso', verifyToken, ticketReembolsoController.getAllReembolsos);
router.get('/ticket-reembolso/:id', verifyToken, ticketReembolsoController.getReembolsoById);
router.post('/ticket-reembolso', verifyToken, ticketReembolsoController.createReembolso);
router.put('/ticket-reembolso/:id', verifyToken, ticketReembolsoController.updateReembolso);
router.delete('/ticket-reembolso/:id', verifyToken, ticketReembolsoController.deleteReembolso);

module.exports = router;



