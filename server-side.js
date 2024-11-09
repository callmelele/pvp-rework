const WebSocket = require('ws');
const ws = new WebSocket.Server({ port: 3000 });

let clientCount = 0;
const clients = [];

ws.on('connection', function connection(ws) {
    const playerId = `player${++clientCount}`;
    ws.playerId = playerId;

    clients.push(ws);
    console.log(`New client connected as ${playerId}. Total clients: ${clients.length}`);

    ws.send(JSON.stringify({ type: 'init', id: playerId }));

    ws.on('message', function incoming(message) {
        console.log('Received: %s', message);
        const data = JSON.parse(message);

        if (data.type === 'updateHealth' || data.type === 'teleport') {
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } else if (data.type === 'move') {
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                    client.send(message);
                }
            });
        }
    });

    ws.on('close', function close() {
        const index = clients.indexOf(ws);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        console.log(`Client disconnected. Total clients: ${clients.length}`);
    });
});

console.log('WebSocket server is listening on ws://localhost:3000');
