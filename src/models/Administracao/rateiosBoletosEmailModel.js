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
  console.log("Entrou")
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

// Deleta um registro
const deleteRateioBoletoEmail = async (id, tipo) => {
  const registro = await getRateioBoletoEmailById(id);
  if (!registro) return false;

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

  const updated = await getRateioBoletoEmailById(id);
  const allFieldsNull = !updated.boletoPdf && !updated.boletoPdfFileName && !updated.rateioPdf && !updated.rateioPdfFileName;

  if (allFieldsNull) {
    await connection.execute('DELETE FROM rateio_por_apartamento WHERE rateio_boleto_email_id = ?', [id]);
    const [result] = await connection.execute('DELETE FROM rateioBoletoEmail WHERE id = ?', [id]);
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
