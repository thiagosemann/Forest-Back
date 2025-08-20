const WebSocket = require('ws');

let wss;
const connections = [];

function createWebSocketServer(server) {
  wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      // Converter o objeto message para uma string
      const messageString = message.toString();
      console.log(`Received message: ${messageString}`);
      if (messageString.startsWith('ID:') || messageString.startsWith('NID:')) {
        const nodeId = messageString.slice(messageString.startsWith('ID:') ? 3 : 4);
        const existingConnectionIndex = connections.findIndex(conn => conn.nodeId === nodeId);
        if (existingConnectionIndex !== -1) {
          connections[existingConnectionIndex].ws = ws;
          connections[existingConnectionIndex].connected = true;
          connections[existingConnectionIndex].lastPongTime = Date.now();
        } else {
          connections.push({ ws, nodeId, connected: true, lastPongTime: Date.now() });
        }

      } 
    });

    ws.on('pong', () => {
     // console.log(`Pong received from client (ID: ${getConnectionNodeId(ws)})`);
     const conn = connections.find((conn) => conn.ws === ws);
     if (conn) {
       conn.lastPongTime = new Date();
     }
    });

    ws.on('close', () => {
      const index = connections.findIndex((conn) => conn.ws === ws);
      if (index !== -1) {
        const connection = connections[index];
        connections.splice(index, 1);
      }
    });
  });

  // Ping-Pong
  const pingInterval = setInterval(() => {
    //logConnectionsStatus(); 
    const now = Date.now();
    const minutes = 60000;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
        const connection = connections.find(conn => conn.ws === client);
        if (connection && (now - connection.lastPongTime > minutes*5)) {
          console.log(`Ping timeout for client (ID: ${connection.nodeId}). Terminating connection.`);
          client.terminate();
        }
      }
    });
  }, 20000);
}


function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}


module.exports = { createWebSocketServer, connections };