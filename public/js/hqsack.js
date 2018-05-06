const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;

let nextShowTime;
let countdownInterval;
const countdown = {
  days: { value: 0 },
  hours: { value: 0, next: 'days' },
  minutes: { value: 0, next: 'hours' },
  seconds: { value: 0, next: 'minutes' }
};

function showCountdown() {
  countdownInterval = setInterval(() => {
    updateTimer(nextShowTime);
  }, 1000)
}

function redrawTimer() {
  $('.days').text(pad(countdown.days.value));
  $('.hours').text(pad(countdown.hours.value));
  $('.minutes').text(pad(countdown.minutes.value));
  $('.seconds').text(pad(countdown.seconds.value));
}

function pad(num) {
  return ('00' + num).substr(-2);
}

function updateTimer(time) {
  nextShowTime = time;
  let diff = new Date(time).getTime() - Date.now();
  countdown.days.value = Math.floor(diff / DAYS);
  diff -= countdown.days.value * DAYS;
  countdown.hours.value = Math.floor(diff / HOURS);
  diff -= countdown.hours.value * HOURS;
  countdown.minutes.value = Math.floor(diff / MINUTES);
  diff -= countdown.minutes.value * MINUTES;
  countdown.seconds.value = Math.floor(diff / SECONDS);
  redrawTimer();
}



function checkShows() {
  $.get('https://api-quiz.hype.space/shows/now', (res) => {
    if (res.active) {
      wakeServer(res.broadcast.socketUrl);
    } else {
      updateTimer(res.nextShowTime);
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
    showCountdown();
    checkShows();
  });
}


showCountdown();
checkShows();