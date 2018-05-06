

function checkShows() {
  $.get('https://api-quiz.hype.space/shows/now', (res) => {
    if (res.active) {
      wakeServer(res.broadcast.socketUrl);
    } else {
      setTimeout(checkShows, 60000);
    }
  });
}

function wakeServer(socketUrl) {
  $.post('/wake', {
    socketUrl: socketUrl
  }, (res) => {
    if (res.proxyUrl) {
      connectToSocket(res.proxyUrl);
    }
  });
}

function connectToSocket(socketUrl) {
  const ws = new WebSocket(socketUrl);
  ws.addEventListener('message', res => {
    const data = JSON.parse(res.data);
    console.log(data);
  });

  ws.addEventListener('close', () => {
    checkShows();
  });
}

checkShows();

