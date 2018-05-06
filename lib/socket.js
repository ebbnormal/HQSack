const WebSocket = require('ws');
const config = require('../config.json');

class SocketProxy {
  use(server) {
    this._httpServer = server;
  }

  listen(url) {
    this._close();

    this.url = url;
    this._connect();
  }

  get socketUrl() {
    return this._server && config.socketUrl;
  }

  _handleMessage(data) {
    data = JSON.parse(data);
    if (data.type === 'question') {

    } else if (data.type === 'broadcastEnded') {
      if (data.reason && data.reason.includes('please join again')) {
        setTimeout(this._connect, 0);
      } else {
        this._close();
      }
    }
  }

  _broadcast(data) {
    if (this._server && this._server.clients)
    for (let conn of this._server.clients) {
      conn.send(data);
    }
  }

  _connect() {
    this._connectToHQ();
    this._startServer();
  }

  _connectToHQ() {
    if (this._url) {
      this._client = new WebSocket(url), {
        headers: {
          authorization: 'Bearer ' + config.hqToken
        }
      };
  
      this._client.on('message', this._handleMessage);
    }
  }

  _startServer() {
    if (this._httpServer) {
      this._server = new WebSocket.Server({
        server: this._httpServer,
        clientTracking: true
      });

      this._server.on('connection', (conn) => {
        this._connections.push(conn);
      });
    }
  }

  _close() {
    if (this._client) {
      this._client.terminate();
    }
    if (this._server) {
      this._server.close();
    }
  }
}

module.exports = new SocketProxy();