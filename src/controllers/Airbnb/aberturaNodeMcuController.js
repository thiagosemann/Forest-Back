const aberturaNodeMcuModel = require('../../models/Airbnb/aberturaNodeMcuModel');

// Buscar todos os registros de aberturas (com filtro de data)
exports.getAllAberturas = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await aberturaNodeMcuModel.getAllAberturas(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aberturas NodeMCU' });
  }
};

// Buscar abertura por ID
exports.getAberturaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await aberturaNodeMcuModel.getAberturaById(id);
    if (result) res.json(result);
    else res.status(404).json({ error: 'Abertura não encontrada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar abertura por ID' });
  }
};

// Buscar aberturas por idNodemcu (com filtro de data)
exports.getAberturasByNodemcu = async (req, res) => {
  try {
    const { idNodemcu } = req.params;
    const { startDate, endDate } = req.query;
    const result = await aberturaNodeMcuModel.getAberturasByNodemcu(idNodemcu, startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aberturas por idNodemcu' });
  }
};

// Buscar aberturas por reserva_id (com filtro de data)
exports.getAberturasByReservaId = async (req, res) => {
  try {
    const { reserva_id } = req.params;
    const { startDate, endDate } = req.query;
    const result = await aberturaNodeMcuModel.getAberturasByReservaId(reserva_id, startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aberturas por reserva_id' });
  }
};

// Buscar aberturas por predio_id (com filtro de data)
exports.getAberturasByPredioId = async (req, res) => {
  try {
    const { predio_id } = req.params;
    const { startDate, endDate } = req.query;
    const result = await aberturaNodeMcuModel.getAberturasByPredioId(predio_id, startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aberturas por predio_id' });
  }
};

// Criar novo registro de abertura
exports.createAbertura = async (req, res) => {
  try {
    const { idNodemcu, nodemcu_predio_id, reserva_id, cod_reserva } = req.body;
    if (!idNodemcu || !nodemcu_predio_id) {
      return res.status(400).json({ error: 'idNodemcu e nodemcu_predio_id são obrigatórios' });
    }
    const result = await aberturaNodeMcuModel.createAbertura({ idNodemcu, nodemcu_predio_id, reserva_id, cod_reserva });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar abertura NodeMCU' });
  }
};

// Deletar registro por ID
exports.deleteAbertura = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await aberturaNodeMcuModel.deleteAbertura(id);
    if (deleted) res.json({ success: true });
    else res.status(404).json({ error: 'Abertura não encontrada para deletar' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar abertura NodeMCU' });
  }
};
