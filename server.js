const server = require('http').createServer();
const socket = require('./lib/socket');
const request = require('request-promise');
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

app.get('/test', (req, res) => {
  res.render('index', { displayTest: true });
});

app.post('/wake', (req, res) => {
  const socketUrl = req.body.socketUrl;
  socket.listen(socketUrl);
  res.json({
    proxyUrl: socket.socketUrl
  });
});

app.get('/search', (req, res) => {
  const highlights = [
    { answer: req.query.hqsackA1.toLowerCase(), color: 'yellow', count: 0 },
    { answer: req.query.hqsackA2.toLowerCase(), color: 'lime', count: 0 },
    { answer: req.query.hqsackA3.toLowerCase(), color: 'aqua', count: 0 }
  ];
  request.get({
    url: 'https://www.bing.com/search',
    qs: { q: req.query.q }
  }).then(html => {
    let countHtml = '<div style="display:inline-block;position:fixed;top:10px;right:50px;">';
    for (let highlight of highlights) {
      const regex = new RegExp(`(>[^<]*\\b)(${highlight.answer}s?)(\\b)`, 'gi');
      // html = html.replace(regex, `$1<span style="background-color:${highlight.color};">$2</span>$3`);
      html = html.replace(regex, (match, preText, answer, postText) => {
        highlight.count++;
        return `${preText}<span style="background-color:${highlight.color};">${answer}</span>${postText}`;
      });

      countHtml += `<span style="display:inline-block;background-color:${highlight.color};` +
        `width:50px;height:50px;font-size:30px;text-align:center;line-height:50px;">${highlight.count}</span>`
    }

    countHtml += '</div>';
    html = html.replace(/<\/body>/, `${countHtml}$&`);
    
    res.send(html);
  });
});

server.on('request', app);
socket.use(server);

server.listen(port, ip, () => {
  console.log('Server listening at:', ip + ':' + port);
});

module.exports = app;