const connection = require('../connection');

const getAllBuildings = async () => {
  const [buildings] = await connection.execute('SELECT * FROM predios');
  return buildings;
};

const createBuilding = async (building) => {
  const { nome, CNPJ, sindico, email, qnt_Apartamentos, sindico_id, cep } = building;
  const insertBuildingQuery = 'INSERT INTO predios (nome, CNPJ, sindico, email, qnt_Apartamentos, sindico_id, cep) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [nome, CNPJ, sindico, email, qnt_Apartamentos, sindico_id, cep];

  try {
    const [result] = await connection.execute(insertBuildingQuery, values);
    return { insertId: result.insertId };
  } catch (error) {
    console.error('Erro ao inserir prédio:', error);
    throw error;
  }
};

const getBuilding = async (id) => {
  const query = 'SELECT * FROM predios WHERE id = ?';
  const [buildings] = await connection.execute(query, [id]);

  if (buildings.length > 0) {
    return buildings[0];
  } else {
    return null;
  }
};

const updateBuilding = async (id, building) => {
  const { nome, CNPJ, sindico, email, qnt_Apartamentos, sindico_id, cep } = building;

  const getBuildingQuery = 'SELECT * FROM predios WHERE id = ?';
  const [existingBuildings] = await connection.execute(getBuildingQuery, [id]);

  if (existingBuildings.length === 0) {
    throw new Error('Prédio não encontrado.');
  }

  const updateBuildingQuery = `
    UPDATE predios 
    SET nome = ?, CNPJ = ?, sindico = ?, email = ?, qnt_Apartamentos = ?, sindico_id = ?, cep = ?
    WHERE id = ?
  `;

  const values = [nome, CNPJ, sindico, email, qnt_Apartamentos, sindico_id, cep, id];

  try {
    await connection.execute(updateBuildingQuery, values);
    return { message: 'Prédio atualizado com sucesso.' };
  } catch (error) {
    console.error('Erro ao atualizar prédio:', error);
    throw error;
  }
};

const deleteBuilding = async (id) => {
  // Verifica se o prédio existe
  const getBuildingQuery = 'SELECT * FROM predios WHERE id = ?';
  const [existingBuildings] = await connection.execute(getBuildingQuery, [id]);

  if (existingBuildings.length === 0) {
    return null;
  }

  // Deleta o prédio
  const deleteBuildingQuery = 'DELETE FROM predios WHERE id = ?';
  try {
    await connection.execute(deleteBuildingQuery, [id]);
    return true;
  } catch (error) {
    console.error('Erro ao excluir prédio:', error);
    throw error;
  }
};

module.exports = {
  getAllBuildings,
  createBuilding,
  getBuilding,
  updateBuilding,
  deleteBuilding
};
