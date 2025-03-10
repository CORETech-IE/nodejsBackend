const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const port = 3000;
const wsPort = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Crear servidor WebSocket
//const wss = new WebSocket.Server({ port: wsPort });
const wss = new WebSocket.Server({ host: '127.0.0.1', port: 3001 });
console.log(`✅ Servidor WebSocket en ws://127.0.0.1:${wsPort}`);

let tauriClient = null;

// Manejar conexiones WebSocket
wss.on('connection', (ws) => {
  console.log('🔌 Cliente WebSocket conectado');

  tauriClient = ws; // Guardamos la conexión de Tauri

  ws.on('message', (message) => {
    console.log('📩 Mensaje recibido de Tauri:', message.toString());

    // Reenviar el mensaje procesado al frontend (Angular)
    if (frontendClient) {
      frontendClient.send(message.toString());
    }
  });

  ws.on('close', () => {
    console.log('❌ Cliente WebSocket desconectado');
    tauriClient = null;
  });
});

// Conexión WebSocket del frontend
const frontendWss = new WebSocket.Server({ port: 3002 });
console.log(`✅ WebSocket para Angular en ws://127.0.0.1:3002`);

let frontendClient = null;
frontendWss.on('connection', (ws) => {
  console.log('🔌 Angular conectado por WebSocket');
  frontendClient = ws;
});

// API para recibir datos desde Angular
app.post('/api/data', (req, res) => {
  const jsonData = req.body;
  console.log('📨 JSON recibido desde Angular:', jsonData);

  if (tauriClient && tauriClient.readyState === WebSocket.OPEN) {
    tauriClient.send(JSON.stringify(jsonData));

    res.status(200).json({
      status: 'success',
      message: 'Datos enviados a Tauri vía WebSocket',
    });
  } else {
    res.status(503).json({
      status: 'error',
      message: '❌ No hay conexión con Tauri',
    });
  }
});

// Iniciar el servidor Express
app.listen(port, () => {
  console.log(`🚀 Servidor Express en http://127.0.0.1:${port}`);
});