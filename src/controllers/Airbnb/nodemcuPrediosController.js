const nodemcuPrediosModel = require('../../models/Airbnb/nodemcuPrediosModel');
const websocket = require('../../WebSocket/websocket');

// Buscar todos os vínculos NodeMCU-Prédio
exports.getAllNodemcuPredios = async (req, res) => {
  try {
    const result = await nodemcuPrediosModel.getAllNodemcuPredios();
    // Adiciona isConnected para cada NodeMCU
    const withStatus = result.map(item => {
      const conn = websocket.connections.find(c => c.nodeId === item.idNodemcu);
      return { ...item, isConnected: !!(conn && conn.connected) };
    });
    res.json(withStatus);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vínculos NodeMCU-Prédio' });
  }
};

// Buscar vínculo por ID
exports.getNodemcuPredioById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await nodemcuPrediosModel.getNodemcuPredioById(id);
    if (result) {
      const conn = websocket.connections.find(c => c.nodeId === result.idNodemcu);
      res.json({ ...result, isConnected: !!(conn && conn.connected) });
    } else res.status(404).json({ error: 'Vínculo não encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vínculo por ID' });
  }
};

// Buscar vínculo por idNodemcu
exports.getNodemcuPredioByNodemcu = async (req, res) => {
  try {
    const { idNodemcu } = req.params;
    const result = await nodemcuPrediosModel.getNodemcuPredioByNodemcu(idNodemcu);
    if (result) {
      const conn = websocket.connections.find(c => c.nodeId === result.idNodemcu);
      res.json({ ...result, isConnected: !!(conn && conn.connected) });
    } else res.status(404).json({ error: 'Vínculo não encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vínculo por idNodemcu' });
  }
};

// Criar novo vínculo NodeMCU-Prédio
exports.createNodemcuPredio = async (req, res) => {
  try {
    const { predio_id, idNodemcu } = req.body;
    if (!predio_id || !idNodemcu) {
      return res.status(400).json({ error: 'predio_id e idNodemcu são obrigatórios' });
    }
    const result = await nodemcuPrediosModel.createNodemcuPredio({ predio_id, idNodemcu });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar vínculo NodeMCU-Prédio' });
  }
};

// Atualizar vínculo NodeMCU-Prédio
exports.updateNodemcuPredio = async (req, res) => {
  try {
    const { id } = req.params;
    const { predio_id, idNodemcu } = req.body;
    if (!predio_id || !idNodemcu) {
      return res.status(400).json({ error: 'predio_id e idNodemcu são obrigatórios' });
    }
    const updated = await nodemcuPrediosModel.updateNodemcuPredio({ id, predio_id, idNodemcu });
    if (updated) res.json({ success: true });
    else res.status(404).json({ error: 'Vínculo não encontrado para atualizar' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar vínculo NodeMCU-Prédio' });
  }
};

// Deletar vínculo por ID
exports.deleteNodemcuPredio = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await nodemcuPrediosModel.deleteNodemcuPredio(id);
    if (deleted) res.json({ success: true });
    else res.status(404).json({ error: 'Vínculo não encontrado para deletar' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar vínculo NodeMCU-Prédio' });
  }
};
