const WebSocket = require('ws');

const server = new WebSocket.Server({
  port: 8081,
  clientTracking: true
});

const messages = require('./messages');
let currentMessage = 0;
let broadcasting = false;

server.on('connection', (conn) => {
  console.log('connected');
  startBroadcast();
});

function startBroadcast() {
  if (broadcasting) {
    return;
  }
  broadcasting = true;
  setInterval(() => {
    const message = messages[currentMessage++];
    for (let conn of server.clients) {
      conn.send(JSON.stringify(message));
      if (currentMessage === messages.length) {
        conn.close();
        currentMessage = 0;
      }
    }
  }, 2000);
}