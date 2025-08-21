
const { wss, connections } = require('../WebSocket/websocket');
const reservasAirbnbModel = require('../models/Airbnb/reservasAirbnbModel');
const apartamentosModel = require('../models/Airbnb/apartamentosAirbnbModel');
const connection2 = require('../models/connection2');
const nodemcuPrediosModel = require('../models/Airbnb/nodemcuPrediosModel');
const nodemcuAberturasModel = require('../models/Airbnb/nodemcuAberturasModel');

// Controller para acionar NodeMCU via rota
exports.ligarNodeMcu = async (req, res) => {
    const { nodeId, cod_reserva } = req.body;
    if (!nodeId || !cod_reserva) {
        return res.status(400).json({ success: false, message: 'nodeId e cod_reserva são obrigatórios.' });
    }
    try {
        const targetConnection = connections.find((connection) => connection.nodeId === nodeId);
        if (!targetConnection) {
            return res.status(404).json({ success: false, message: 'Nenhuma conexão ativa encontrada para o NodeMCU especificado', nodeId });
        }
        let nodemcu_predio_id = null;
        let reserva_id = null;
        let codParaSalvar = cod_reserva;
        if (cod_reserva === 'LIBERACAO_MANUAL') {
            // Busca vínculo NodeMCU-Prédio
            const nodemcuPredios = await nodemcuPrediosModel.getNodemcuPredioByNodemcu(nodeId);
            if (!nodemcuPredios) {
                return res.status(404).json({ success: false, message: 'Nenhum vínculo NodeMCU-Prédio encontrado para o NodeMCU especificado', nodeId });
            }
            nodemcu_predio_id = nodemcuPredios.id;
            // Envia comando
            const binaryMessage = Buffer.from([0x01]);
            targetConnection.ws.send(binaryMessage);
            let confirmationReceived = false;
            const confirmationTimeout = setTimeout(() => {
                if (!confirmationReceived) {
                    return res.status(504).json({ success: false, message: 'Timeout: Falha ao ligar o NodeMCU ou relé não ativado', nodeId });
                }
            }, 5000);
            targetConnection.ws.once('message', async (message) => {
                const messageString = message.toString();
                if (messageString === 'RelayStatus:ON') {
                    confirmationReceived = true;
                    clearTimeout(confirmationTimeout);
                    await nodemcuAberturasModel.create({
                        idNodemcu: nodeId,
                        nodemcu_predio_id,
                        reserva_id: null,
                        cod_reserva: 'LIBERACAO_MANUAL'
                    });
                    return res.json({ success: true, message: 'NodeMCU ligado com sucesso (liberação manual)', nodeId });
                }
            });
            return;
        }
        // Buscar reserva pelo código
        const reserva = await reservasAirbnbModel.getReservaByCod(cod_reserva);
        if (!reserva) {
            return res.status(404).json({ success: false, message: 'Reserva não encontrada para o código informado', cod_reserva });
        }
        const apartamento = await apartamentosModel.getApartamentoById(reserva.apartamento_id);
        if (!apartamento) {
            return res.status(404).json({ success: false, message: 'Apartamento não encontrado para a reserva', cod_reserva });
        }
        const nodemcuPredios = await nodemcuPrediosModel.getNodemcuPredioByNodemcu(nodeId);
        if (!nodemcuPredios) {
            return res.status(404).json({ success: false, message: 'Nenhum vínculo NodeMCU-Prédio encontrado para o NodeMCU especificado', nodeId });
        }
        
        nodemcu_predio_id = nodemcuPredios ? nodemcuPredios.id : null;
        if(nodemcu_predio_id != apartamento.predio_id){
            return res.status(403).json({ success: false, message: 'Esse prédio não está vinculado a sua reserva!', nodeId, predio_id: apartamento.predio_id });
        }
        // Verificar se hoje está entre start_date e end_data
        const hoje = new Date();
        const start = new Date(reserva.start_date);
        const end = new Date(reserva.end_data);
        if (hoje < start || hoje > end) {
            return res.status(403).json({ success: false, message: 'Reserva não está ativa para hoje', start_date: reserva.start_date, end_data: reserva.end_data });
        }
        // Enviar comando para NodeMCU
        const binaryMessage = Buffer.from([0x01]);
        targetConnection.ws.send(binaryMessage);
        let confirmationReceived = false;
        const confirmationTimeout = setTimeout(() => {
            if (!confirmationReceived) {
                return res.status(504).json({ success: false, message: 'Timeout: Falha ao ligar o NodeMCU ou relé não ativado', nodeId });
            }
        }, 5000);
        targetConnection.ws.once('message', async (message) => {
            const messageString = message.toString();
            if (messageString === 'RelayStatus:ON') {
                confirmationReceived = true;
                clearTimeout(confirmationTimeout);
                // Buscar nodemcu_predio_id (opcional: você pode adaptar para buscar pelo nodeId)

                try {
                    const [rows] = await connection2.execute('SELECT id FROM nodemcu_predio WHERE idNodemcu = ?', [nodeId]);
                    if (rows.length) nodemcu_predio_id = rows[0].id;
                } catch (e) { /* ignora erro */ }
                // Registrar abertura
                await nodemcuAberturasModel.create({
                    idNodemcu: nodeId,
                    nodemcu_predio_id,
                    reserva_id: reserva.id,
                    cod_reserva
                });
                return res.json({ success: true, message: 'NodeMCU ligado com sucesso', nodeId, reserva_id: reserva.id });
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Erro ao ligar nodemcu', nodeId, error: err.message });
    }
};


