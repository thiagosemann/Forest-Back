const connection = require('../connection');

const getAllIndividualExpenses = async () => {
  try {
    const [expenses] = await connection.execute('SELECT * FROM Gastos_Individuais');
    return expenses;
  } catch (error) {
    console.error('Erro ao buscar gastos individuais:', error);
    throw error;
  }
};

const createIndividualExpense = async (expense) => {
  const { apt_id, aguaM3, aguaValor, gasM3, gasValor, lazer, lavanderia, multa, data_gasto } = expense;

  const selectExpenseQuery = 'SELECT * FROM Gastos_Individuais WHERE apt_id = ? AND aguaM3 = ? AND aguaValor = ? AND gasM3 = ? AND gasValor = ? AND lazer = ? AND lavanderia = ? AND multa = ? AND data_gasto = ?';
  const selectValues = [apt_id, aguaM3, aguaValor, gasM3, gasValor, lazer, lavanderia, multa, data_gasto];
  
  // Verifica se já existe um gasto com os mesmos atributos
  const [existingExpenses] = await connection.execute(selectExpenseQuery, selectValues);
  if (existingExpenses.length > 0) {
    return { message: 'Este gasto já foi inserido anteriormente.' };
  }

  const insertExpenseQuery = 'INSERT INTO Gastos_Individuais (apt_id, aguaM3, aguaValor, gasM3, gasValor, lazer, lavanderia, multa, data_gasto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const insertValues = [apt_id, aguaM3, aguaValor, gasM3, gasValor, lazer, lavanderia, multa, data_gasto];

  try {
    const [result] = await connection.execute(insertExpenseQuery, insertValues);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir gasto individual:', error);
    throw error;
  }
};

const getIndividualExpense = async (id) => {
  const query = 'SELECT * FROM Gastos_Individuais WHERE id = ?';
  const [expenses] = await connection.execute(query, [id]);

  if (expenses.length > 0) {
    return expenses[0];
  } else {
    return null;
  }
};

const updateIndividualExpense = async (id, expense) => {
  const { apt_id, aguaM3, aguaValor, gasM3, gasValor, lazer, lavanderia, multa, data_gasto } = expense;

  const getExpenseQuery = 'SELECT * FROM Gastos_Individuais WHERE id = ?';
  const [existingExpenses] = await connection.execute(getExpenseQuery, [id]);

  if (existingExpenses.length === 0) {
    throw new Error('Gasto individual não encontrado.');
  }

  const updateExpenseQuery = `
    UPDATE Gastos_Individuais 
    SET apt_id = ?, aguaM3 = ?, aguaValor = ?, gasM3 = ?, gasValor = ?, lazer = ?, lavanderia = ?, multa = ?, data_gasto = ?
    WHERE id = ?
  `;

  const values = [apt_id, aguaM3, aguaValor, gasM3, gasValor, lazer, lavanderia, multa, data_gasto, id];

  try {
    await connection.execute(updateExpenseQuery, values);
    return { message: 'Gasto individual atualizado com sucesso.' };
  } catch (error) {
    console.error('Erro ao atualizar gasto individual:', error);
    throw error;
  }
};

const deleteIndividualExpense = async (id) => {
  const getExpenseQuery = 'SELECT * FROM Gastos_Individuais WHERE id = ?';
  const [existingExpenses] = await connection.execute(getExpenseQuery, [id]);

  if (existingExpenses.length === 0) {
    return null;
  }

  const deleteExpenseQuery = 'DELETE FROM Gastos_Individuais WHERE id = ?';
  try {
    await connection.execute(deleteExpenseQuery, [id]);
    return true;
  } catch (error) {
    console.error('Erro ao excluir gasto individual:', error);
    throw error;
  }
};

const getExpensesByApartment = async (apt_id) => {
  const query = 'SELECT * FROM Gastos_Individuais WHERE apt_id = ?';
  try {
    const [expenses] = await connection.execute(query, [apt_id]);
    return expenses;
  } catch (error) {
    console.error('Erro ao buscar gastos por apartamento:', error);
    throw error;
  }
};




const getIndividualExpensesByAptIdMonthAndYear = async (id, month, year) => {
  try {
    // Consulta na tabela Gastos_Individuais pelo apt_id = id, filtrando pelo mês e ano informados
    const indExpQuery = `
      SELECT id, apt_id, aguaM3, aguaValor, gasM3, gasValor, lazer, lavanderia, multa 
      FROM Gastos_Individuais 
      WHERE apt_id = ? 
        AND YEAR(data_gasto) = ? 
        AND MONTH(data_gasto) = ?
      LIMIT 1
    `;
    
    // Executa a consulta utilizando o id informado, year e month
    const [individualExpenses] = await connection.execute(indExpQuery, [id, year, month]);
    // Retorna o primeiro objeto encontrado ou null, se não houver registros
    return individualExpenses.length > 0 ? individualExpenses[0] : null;
  } catch (error) {
    console.error('Erro ao buscar gasto por apartamento e mês:', error);
    throw error;
  }
};



const getIndividualExpensesByPredioIdMonthAndYear = async (predio_id, month, year) => {
    try {
      // Busca os apartamentos vinculados ao prédio
      const aptQuery = 'SELECT id, nome, fracao FROM apartamentos WHERE predio_id = ?';
      const [apartments] = await connection.execute(aptQuery, [predio_id]);
  
      // Array para armazenar os gastos individuais por apartamento
      const expensesByApartment = [];
  
      // Para cada apartamento encontrado
      for (const apartment of apartments) {
        const { id: apt_id, nome: apt_name, fracao: apt_fracao } = apartment;
  
        // Consulta os gastos individuais para o apartamento específico, no mês e ano especificados
        const indExpQuery = `
          SELECT id, apt_id, aguaM3, aguaValor, gasM3, gasValor, lazer, lavanderia, multa 
          FROM Gastos_Individuais 
          WHERE apt_id = ? AND YEAR(data_gasto) = ? AND MONTH(data_gasto) = ?
        `;
        const [individualExpenses] = await connection.execute(indExpQuery, [apt_id, year, month]);
  
        // Para cada gasto individual encontrado, adiciona informações do apartamento
        for (const expense of individualExpenses) {
          const expWithAptInfo = {
            ...expense,
            apt_name,
            apt_fracao
          };
          expensesByApartment.push(expWithAptInfo);
        }
      }
  
      return expensesByApartment;
    } catch (error) {
      console.error('Erro ao buscar gastos por apartamento e mês:', error);
      throw error;
    }
  };
  
  
  const deleteIndividualExpensesInBatch = async (expenseIds) => {
    if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
      throw new Error('É necessário fornecer um array de IDs válido.');
    }
  
    // Cria placeholders dinâmicos (?, ?, ?)
    const placeholders = expenseIds.map(() => '?').join(',');
    const deleteQuery = `DELETE FROM Gastos_Individuais WHERE id IN (${placeholders})`;
  
    try {
      // Passa os IDs diretamente como parâmetros
      const [result] = await connection.execute(deleteQuery, expenseIds);
      return { affectedRows: result.affectedRows };
    } catch (error) {
      console.error('Erro ao excluir gastos individuais em lote:', error);
      throw error;
    }
  };

module.exports = {
  getAllIndividualExpenses,
  createIndividualExpense,
  getIndividualExpense,
  updateIndividualExpense,
  deleteIndividualExpense,
  getExpensesByApartment,
  getIndividualExpensesByPredioIdMonthAndYear,
  deleteIndividualExpensesInBatch,
  getIndividualExpensesByAptIdMonthAndYear
};
