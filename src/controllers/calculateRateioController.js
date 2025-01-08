
const individualExpensesModel = require('../models/gastosIndividuaisModel');
const commonExpensesModel = require('../models/gastosComunModel');
const vagasModel = require('../models/vagasModel');
const fundoModel = require('../models/fundoModel');
const provisaoModel = require('../models/provisaoModel');


const getRateioByBuildingMonthAndYear = async (request, response) => {
  const { predio_id, month, year } = request.params; // Pegar os parâmetros da rota    
  try {
    // Buscar gastos comuns e calcular o valor total
    const commonExpenses = await commonExpensesModel.getExpensesByBuildingAndMonth(predio_id, month, year);
    if (!commonExpenses.length) {
      return response.status(200).json({ error: 'Gastos comuns não encontrados' });
    }
    const valorComumTotal = commonExpenses.reduce((acc, gasto) => 
      gasto.tipo === "Rateio" ? acc + parseFloat(gasto.valor) : acc, 0);
  
    // Buscar gastos individuais
    const individualExpenses = await individualExpensesModel.getIndividualExpensesByAptMonthAndYear(predio_id, month, year);
    if (!individualExpenses.length) {
      return response.status(200).json({ error: 'Gastos individuais não encontrados' });
    }
  
    // Buscar Fundos e calcular o total
    const fundos = await fundoModel.getFundosByBuildingId(predio_id);
    if (!fundos.length) {
      return response.status(200).json({ error: 'Fundos não encontrados' });
    }
    const valorFundoTotal = fundos.reduce((acc, fundo) => 
      acc + parseFloat(fundo.porcentagem) * valorComumTotal, 0);
  
    // Mapear as frequências para os multiplicadores das provisões

  
    // Buscar Provisões e calcular o valor total ajustado pela frequência
    const provisoes = await provisaoModel.getProvisoesByBuildingId(predio_id);
    if (!provisoes.length) {
      return response.status(200).json({ error: 'Provisões não encontradas' });
    }
    const valorProvisaoTotal = provisoes.reduce((acc, provisao) => 
      acc + parseFloat(provisao.valor) / (Number(provisao.frequencia) || 0), 0);
  
    // Montar o array de rateios
    const rateio = await Promise.all(individualExpenses.map(async (gastoIndividual) => {
      const vagas = await vagasModel.getVagasByApartamentId(gastoIndividual.apt_id);
      const fracaoTotal = vagas.reduce((acc, vaga) => acc + parseFloat(vaga.fracao), parseFloat(gastoIndividual.apt_fracao));
  
      const valorIndividualTotal = ["aguaValor", "gasValor", "lazer", "lavanderia", "multa"]
        .reduce((acc, key) => acc + parseFloat(gastoIndividual[key] || 0), 0);
  
      return {
        apt_name: gastoIndividual.apt_name,
        apt_fracao: gastoIndividual.apt_fracao,
        valorIndividual: valorIndividualTotal,
        valorComum: valorComumTotal * fracaoTotal,
        valorProvisoes: valorProvisaoTotal * fracaoTotal,
        valorFundos: valorFundoTotal * fracaoTotal,
        apartamento_id: gastoIndividual.apt_id,
        fracao_total: fracaoTotal,
        vagas: vagas
      };
    }));
  
    // Retornar os valores calculados em formato JSON
    response.json({
      rateio,
      valorComumTotal,
      valorProvisaoTotal,
      valorFundoTotal
    });
  
  } catch (error) {
    console.error('Erro ao buscar rateio por prédio, mês e ano:', error);
    response.status(500).json({ error: 'Erro ao buscar rateio' });
  }
  
};


module.exports = {
  getRateioByBuildingMonthAndYear,
};

