
const individualExpensesModel = require('../../models/Administracao/gastosIndividuaisModel');
const commonExpensesModel = require('../../models/Administracao/gastosComunModel');
const vagasModel = require('../../models/Administracao/vagasModel');
const fundoModel = require('../../models/Administracao/fundoModel');
const provisaoModel = require('../../models/Administracao/provisaoModel');
const apartamentoModel = require('../../models/Administracao/apartamentoModel');


const getRateioByBuildingMonthAndYear = async (request, response) => {
  const { predio_id, month, year } = request.params;    
  try {
    // Buscar gastos comuns (obrigatório)
    const commonExpenses = await commonExpensesModel.getExpensesByBuildingAndMonth(predio_id, month, year);
    if (!commonExpenses.length) {
      return response.status(200).json({ error: 'Gastos comuns não encontrados' });
    }
    const valorComumTotal = commonExpenses.reduce((acc, gasto) => 
      gasto.tipo === "Rateio" ? acc + parseFloat(gasto.valor) : acc, 0);

    // Buscar todos os apartamentos do prédio
    const apartamentos = await apartamentoModel.getApartamentosByBuildingId(predio_id);
    if (!apartamentos.length) {
      return response.status(200).json({ error: 'Nenhum apartamento encontrado' });
    }
    // Buscar gastos individuais (opcional)
    const individualExpenses = await individualExpensesModel.getIndividualExpensesByPredioIdMonthAndYear(predio_id, month, year);

    // Buscar Fundos (opcional)
    const fundos = await fundoModel.getFundosByBuildingId(predio_id);
    const valorFundoTotal = fundos.reduce((acc, fundo) => 
      acc + (parseFloat(fundo.porcentagem) * valorComumTotal), 0);

    // Buscar Provisões (opcional)
    const provisoes = await provisaoModel.getProvisoesByBuildingId(predio_id);
    const valorProvisaoTotal = provisoes.reduce((acc, provisao) => {
      const frequencia = Number(provisao.frequencia) || 1;
      return acc + (parseFloat(provisao.valor) / frequencia);
    }, 0);
    // Mapear todos os apartamentos para o rateio
    const rateio = await Promise.all(apartamentos.map(async (apartamento) => {
      // Encontrar gasto individual correspondente ao apartamento (se existir)
      const gastoIndividual = individualExpenses.find(e => e.apt_id === apartamento.id) || {
        aguaValor: 0,
        gasValor: 0,
        lazer: 0,
        lavanderia: 0,
        multa: 0
      };
      // Buscar vagas e calcular fração total
      const vagas = await vagasModel.getVagasByApartamentId(apartamento.id);
      let  fracaoTotal = 0;
      if(vagas.length!=0){
         fracaoTotal = vagas.reduce((acc, vaga) => 
          acc + parseFloat(vaga.fracao), parseFloat(apartamento.fracao));
      }else{
        fracaoTotal = parseFloat(apartamento.fracao)
      }

      // Calcular valores individuais
      const valorIndividualTotal = ["aguaValor", "gasValor", "lazer", "lavanderia", "multa"]
        .reduce((acc, key) => acc + parseFloat(gastoIndividual[key] || 0), 0);

      return {
        apt_name: apartamento.nome,
        apt_fracao: apartamento.fracao,
        valorIndividual: valorIndividualTotal,
        valorComum: valorComumTotal * fracaoTotal,
        valorProvisoes: valorProvisaoTotal * fracaoTotal,
        valorFundos: valorFundoTotal * fracaoTotal,
        apartamento_id: apartamento.id,
        fracao_total: fracaoTotal,
        vagas: vagas,
        mes: month,
        ano: year
      };
    }));

    response.json({
      rateio,
      valorComumTotal,
      valorProvisaoTotal: valorProvisaoTotal || 0,
      valorFundoTotal: valorFundoTotal || 0
    });

  } catch (error) {
    console.error('Erro ao buscar rateio:', error);
    response.status(500).json({ error: 'Erro ao buscar rateio' });
  }
};

module.exports = {
  getRateioByBuildingMonthAndYear,
};

