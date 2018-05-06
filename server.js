const server = require('http').createServer();
const socket = require('./lib/socket');
const stylus = require('stylus');
const favicon = require('serve-favicon');
const express = require('express');
const app = express();

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
const ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.set('view engine', 'pug');
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const compileStylus = (str, path) => {
  return stylus(str)
    .set('filename', path);
};

app.use(stylus.middleware({
  src: __dirname + "/public/css",
  compile: compileStylus
}));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/wake', (req, res) => {
  const socketUrl = req.body.socketUrl;
  socket.listen(socketUrl);
  res.json({
    proxyUrl: socket.socketUrl
  });
});

server.on('request', app);
socket.use(server);

server.listen(port, ip, () => {
  console.log('Server listening at:', ip + ':' + port);
});

module.exports = app;