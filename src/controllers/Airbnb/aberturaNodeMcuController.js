const aberturaNodeMcuModel = require('../../models/Airbnb/aberturaNodeMcuModel');

// Buscar todos os registros de aberturas
exports.getAllAberturas = async (req, res) => {
  try {
    const result = await aberturaNodeMcuModel.getAllAberturas();
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

// Buscar aberturas por idNodemcu
exports.getAberturasByNodemcu = async (req, res) => {
  try {
    const { idNodemcu } = req.params;
    const result = await aberturaNodeMcuModel.getAberturasByNodemcu(idNodemcu);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aberturas por idNodemcu' });
  }
};

// Buscar aberturas por reserva_id
exports.getAberturasByReservaId = async (req, res) => {
  try {
    const { reserva_id } = req.params;
    const result = await aberturaNodeMcuModel.getAberturasByReservaId(reserva_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aberturas por reserva_id' });
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
