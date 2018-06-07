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
      updateCountdown(nextShowTime);
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

function showTestQuestion() {
  const testQuestion = {
    question: 'In which of these shows did main characters work for the chain restaurant Los Pollos Hermanos?',
    questionNumber: 11,
    answers: [
      {
        text: 'Scandal'
      },
      {
        text: 'Breaking Bad'
      },
      {
        text: 'The Big Bang Theory'
      }
    ],
    totalTimeMs: 10000,
    askTime: new Date().toISOString(),
    received: new Date().toISOString()
  };
  updateQuestion(testQuestion);
}


/* Countdown logic */
const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;

let nextShowTime;
let countdownInterval;
const countdown = {
  negative: false,
  hours: { value: 0 },
  minutes: { value: 0 },
  seconds: { value: 0 }
};

function redrawCountdown() {
  $('.hours').text((countdown.negative ? '-' : '') + pad(countdown.hours.value));
  $('.minutes').text(pad(countdown.minutes.value));
  $('.seconds').text(pad(countdown.seconds.value));
}

function pad(num) {
  return ('00' + num).substr(-2);
}

function updateCountdown(time) {
  nextShowTime = time;
  let diff = new Date(time).getTime() - Date.now();
  countdown.negative = diff < 0;
  diff = Math.abs(diff);
  countdown.hours.value = Math.floor(diff / HOURS);
  diff -= countdown.hours.value * HOURS;
  countdown.minutes.value = Math.floor(diff / MINUTES);
  diff -= countdown.minutes.value * MINUTES;
  countdown.seconds.value = Math.floor(diff / SECONDS);
  redrawCountdown();
}


/* Question logic */
const bingUrl = 'https://www.bing.com/search?q=';
const proxySearchUrl = '/search?q=';
let questionSearchUrl = bingUrl;
const answerModifiers = [];
let lastQuestion;
let questionTimer = 10;
let askTime;
let totalTime;
let interval;

function attachQuestionListeners() {
  $('.question-text').on('click', '.question-word', e => {
    const word = e.target.innerText.replace(/(?:^[?.!"“,'])|(?:[?.!"”,]$)/g, '');
    selectAnswerSearchModifier(word, e.shiftKey);
  });

  $('.question-text').on('contextmenu', '.question-word', e => {
    const word = e.target.innerText.replace(/(?:^[?.!",'])|(?:[?.!"”,]$)/g, '');
    selectAnswerSearchModifier(word, true);
    return false;
  });

  $('.clear-modifiers').click(() => {
    selectAnswerSearchModifier(null);
  });

  $('#highlight-box').change(() => {
    if ($('#highlight-box')[0].checked) {
      questionSearchUrl = proxySearchUrl;
      $('.page.question').addClass('highlighted');
    } else {
      questionSearchUrl = bingUrl;
      $('.highlighted').removeClass('highlighted');
    }

    if (currentDisplay === DISPLAY_QUESTION) {
      loadQuestionSearch(lastQuestion);
    }
  });

  $('#highlight-box').change();
}

function updateQuestion(data) {
  lastQuestion = data;
  showQuestion();
  startQuestionTimer(data);

  answerModifiers.splice(0, answerModifiers.length);
  $('.clear-modifiers').addClass('hidden');

  $('.question-number').text(`Question ${data.questionNumber}:`);
  let questionHtml = '';
  for (let word of data.question.split(' ')) {
    questionHtml += ` <span class="question-word">${word}</span>`;
  }
  $('.question-text').html(questionHtml);

  $('.answer.one').text(data.answers[0].text);
  $('.answer.two').text(data.answers[1].text);
  $('.answer.three').text(data.answers[2].text);

  loadQuestionSearch(data);
  loadAnswerSearches(data);
}

function loadQuestionSearch(data) {
  const answersQuery = `&hqsackA1=${encodeURIComponent(data.answers[0].text)}` +
    `&hqsackA2=${encodeURIComponent(data.answers[1].text)}` +
    `&hqsackA3=${encodeURIComponent(data.answers[2].text)}`;

  $('iframe.question-search').attr('src', questionSearchUrl +
    encodeURIComponent(data.question) + answersQuery);
}

function loadAnswerSearches(data) {
  $('iframe.answer-one')
    .attr('src', bingUrl + encodeURIComponent(data.answers[0].text));
  $('iframe.answer-two')
    .attr('src', bingUrl + encodeURIComponent(data.answers[1].text));
  $('iframe.answer-three')
    .attr('src', bingUrl + encodeURIComponent(data.answers[2].text));
}

function selectAnswerSearchModifier(word, append) {
  if (!append) {
    answerModifiers.splice(0, answerModifiers.length);
  }
  if (word) {
    $('.clear-modifiers').removeClass('hidden');
    answerModifiers.push(word);
  } else {
    $('.clear-modifiers').addClass('hidden');
  }
  modifierString = ' ' + answerModifiers.join(' ');

  $('iframe.answer-one')
    .attr('src', bingUrl + encodeURIComponent(lastQuestion.answers[0].text + modifierString));
  $('iframe.answer-two')
    .attr('src', bingUrl + encodeURIComponent(lastQuestion.answers[1].text + modifierString));
  $('iframe.answer-three')
    .attr('src', bingUrl + encodeURIComponent(lastQuestion.answers[2].text + modifierString));
}

function startQuestionTimer(question) {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  $('.question-timer').css('color', '');
  askTime = new Date(question.received).getTime();
  totalTime = question.totalTimeMs;
  updateQuestionTimer();

  interval = setInterval(() => {
    updateQuestionTimer();
    if (questionTimer === 0) {
      clearInterval(interval);
      interval = null;
    }
  }, 1000);
}

function updateQuestionTimer() {
  let elapsed = Date.now() - askTime;
  questionTimer = Math.max(0, Math.ceil((totalTime - elapsed) / 1000));

  if (questionTimer < 4) {
    $('.question-timer').css('color', 'red');
  }

  $('.question-timer').text(questionTimer);
}


/* Networking logic */
function checkShows() {
  $.get('https://api-quiz.hype.space/shows/now', (res) => {
    if (res.active) {
      showWaiting();
      wakeServer(res.broadcast.socketUrl);
    } else {
      updateCountdown(res.nextShowTime);
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
  attachQuestionListeners();
  if (!window.displayTest) {
    showCountdown();
    checkShows();
  } else {
    showTestQuestion();
  }
});
