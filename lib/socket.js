const WebSocket = require('ws');
const config = require('../config.json');

class SocketProxy {
  use(server) {
    this._httpServer = server;
  }

  listen(url) {
    if (this._url === url) {
      return;
    }
    this._close();

    this._url = url;
    this._connect();
  }

  get socketUrl() {
    return this._server && config.socketUrl;
  }

  _handleMessage(data) {
    data = JSON.parse(data);
    if (data.type === 'question') {
      this._broadcast(data);
    } else if (data.type === 'broadcastEnded') {
      if (data.reason && data.reason.includes('join again')) {
        setTimeout(() => this._connectToHQ(), 0);
      } else {
        this._close();
      }
    }
  }

  _broadcast(data) {
    if (this._server && this._server.clients) {
      for (let conn of this._server.clients) {
        conn.send(JSON.stringify(data));
      }
    }
  }

  _connect() {
    this._connectToHQ();
    this._startServer();
  }

  _connectToHQ() {
    if (this._url) {
      this._client = new WebSocket(this._url.replace(/https?/, 'wss'), {
        headers: {
          authorization: 'Bearer ' + config.hqToken
        }
      });
  
      this._client.on('message', data => this._handleMessage(data));
    }
  }

  _startServer() {
    if (this._httpServer) {
      this._server = new WebSocket.Server({
        server: this._httpServer,
        clientTracking: true
      });
    }
  }

  _close() {
    if (this._client) {
      this._client.terminate();
      this._client = null;
      this._url = null;
    }
    if (this._server) {
      this._server.close();
      this._server = null;
    }
  }
}

module.exports = new SocketProxy();