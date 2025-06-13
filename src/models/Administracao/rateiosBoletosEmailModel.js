const connection = require('../connection');

// Retorna todos os registros
const getAllRateioBoletoEmails = async () => {
  const [rows] = await connection.execute(
    'SELECT * FROM rateioBoletoEmail'
  );
  return rows;
};

// Cria um novo registro e retorna o id
const createRateioBoletoEmail = async ({
  rateioPdf,
  boletoPdf,
  rateioPdfFileName,
  boletoPdfFileName
}) => {
  const query = `
    INSERT INTO rateioBoletoEmail
      (rateioPdf, boletoPdf, rateioPdfFileName, boletoPdfFileName)
    VALUES (?, ?, ?, ?)
  `;
  
  const values = [
    rateioPdf || null,
    boletoPdf || null,
    rateioPdfFileName || null,
    boletoPdfFileName || null,
  ];

  const [result] = await connection.execute(query, values);
  return { id: result.insertId };
};

// Busca um registro pelo ID
const getRateioBoletoEmailById = async (id) => {
  const [rows] = await connection.execute(
    'SELECT * FROM rateioBoletoEmail WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

// Atualiza um registro
const updateRateioBoletoEmail = async ({
  id,
  rateioPdf,
  boletoPdf,
  rateioPdfFileName,
  boletoPdfFileName,
}) => {
  const query = `
    UPDATE rateioBoletoEmail
    SET rateioPdf = ?, boletoPdf = ?, rateioPdfFileName = ?, boletoPdfFileName = ?
    WHERE id = ?
  `;
  const values = [
    rateioPdf,
    boletoPdf,
    rateioPdfFileName,
    boletoPdfFileName,
    id
  ];
  const [result] = await connection.execute(query, values);
  return result.affectedRows > 0;
};

const deleteRateioBoletoEmail = async (id, tipo) => {
  const registro = await getRateioBoletoEmailById(id);
  if (!registro) return false;

  // 1) Zera os campos de PDF no rateioBoletoEmail
  let query = 'UPDATE rateioBoletoEmail SET ';
  const params = [];

  if (tipo === 'boleto') {
    query += 'boletoPdf = NULL, boletoPdfFileName = NULL ';
  } else if (tipo === 'rateio') {
    query += 'rateioPdf = NULL, rateioPdfFileName = NULL ';
  } else {
    throw new Error('Tipo inválido');
  }

  query += 'WHERE id = ?';
  params.push(id);

  await connection.execute(query, params);

  // 2) Verifica se todos os campos de PDF estão nulos
  const updated = await getRateioBoletoEmailById(id);
  const allFieldsNull =
    !updated.boletoPdf &&
    !updated.boletoPdfFileName &&
    !updated.rateioPdf &&
    !updated.rateioPdfFileName;

  if (allFieldsNull) {
    // 3) Em vez de deletar, apenas desassocia na rateio_por_apartamento
    await connection.execute(
      'UPDATE rateio_por_apartamento SET rateio_boleto_email_id = NULL WHERE rateio_boleto_email_id = ?',
      [id]
    );

    // 4) Aí sim podemos deletar o registro em rateioBoletoEmail
    const [result] = await connection.execute(
      'DELETE FROM rateioBoletoEmail WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  return true;
};


module.exports = {
  getAllRateioBoletoEmails,
  createRateioBoletoEmail,
  getRateioBoletoEmailById,
  updateRateioBoletoEmail,
  deleteRateioBoletoEmail
};
