/* Display toggles */
const DISPLAY_COUNTDOWN = 1;
const DISPLAY_WAITING = 2;
const DISPLAY_QUESTION = 3;
let currentDisplay;

function showCountdown() {
  if (currentDisplay !== DISPLAY_COUNTDOWN) {
    currentDisplay = DISPLAY_COUNTDOWN;
    $('.waiting, .question').addClass('hidden');
    $('.countdown').removeClass('hidden');
    countdownInterval = setInterval(() => {
      updateTimer(nextShowTime);
    }, 1000);
  }
  window.scrollTo(0, 0);
}

function showWaiting() {
  if (currentDisplay !== DISPLAY_WAITING) {
    currentDisplay = DISPLAY_WAITING;
    $('.countdown, .question').addClass('hidden');
    $('.waiting').removeClass('hidden');
  }
  window.scrollTo(0, 0);
}

function showQuestion() {
  if (currentDisplay !== DISPLAY_QUESTION) {
    currentDisplay = DISPLAY_QUESTION;
    $('.countdown, .waiting').addClass('hidden');
    $('.question').removeClass('hidden');
  }
  window.scrollTo(0, 0);
}


/* Countdown logic */
const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;

let nextShowTime;
let countdownInterval;
const countdown = {
  hours: { value: 0 },
  minutes: { value: 0 },
  seconds: { value: 0 }
};

function redrawTimer() {
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
  countdown.hours.value = Math.floor(diff / HOURS);
  diff -= countdown.hours.value * HOURS;
  countdown.minutes.value = Math.floor(diff / MINUTES);
  diff -= countdown.minutes.value * MINUTES;
  countdown.seconds.value = Math.floor(diff / SECONDS);
  redrawTimer();
}


/* Question logic */
const bingUrl = 'https://www.bing.com/search?q=';

function updateQuestion(data) {
  showQuestion();
  $('p.question').text('Question ' + data.questionNumber + ': ' + data.question);
  $('iframe.question')
    .attr('src', bingUrl + encodeURIComponent(data.question));
  $('iframe.answer-one')
    .attr('src', bingUrl + encodeURIComponent(data.answers[0].text));
  $('iframe.answer-two')
    .attr('src', bingUrl + encodeURIComponent(data.answers[1].text));
  $('iframe.answer-three')
    .attr('src', bingUrl + encodeURIComponent(data.answers[2].text));
}


/* Networking logic */
function checkShows() {
  $.get('https://api-quiz.hype.space/shows/now', (res) => {
    if (res.active) {
      showWaiting();
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
    updateQuestion(data);
  });

  ws.addEventListener('close', () => {
    showCountdown();
    checkShows();
  });
}


/* Init */
$(() => {
  if (!window.displayTest) {
    showCountdown();
    checkShows();
  } else {
    const testQuestion = {
      question: 'Which of these divisions of geologic time is the shortest?',
      questionNumber: 11,
      answers: [
        {
          text: 'Era'
        },
        {
          text: 'Epoch'
        },
        {
          text: 'Age'
        }
      ]
    };
    updateQuestion(testQuestion);
  }
});