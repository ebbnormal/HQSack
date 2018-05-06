const server = require('http').createServer();
const socket = require('./lib/socket');
const express = require('express');
const app = express();

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
const ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/wake', (req, res) => {
  const socketUrl = req.body.socketUrl;
  socket.listen(socketUrl);
  res.json({
    proxy: socket.socketUrl
  });
});

server.on('request', app);
socket.use(server);

server.listen(port, ip, () => {
  console.log('Server listening at:', ip + ':' + port);
});

module.exports = app;