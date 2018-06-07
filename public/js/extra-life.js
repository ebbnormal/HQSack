let verificationId;

$(() => {
  attachListeners();

  const token = checkAccessToken();
  if (token) {
    showExtraLifeMessage();
    getExtraLife(token);
  } else {
    showPhoneForm();
  }
});


function attachListeners() {
  $('.form.enter-phone').submit(e => {
    submitPhone();
    e.preventDefault();
  });

  $('form.enter-code').submit(e => {
    submitCode();
    e.preventDefault();
  });

  $('.action.clear-token').click(() => {
    clearAccessToken();
    showPhoneForm();
  })
}


function showPhoneForm() {
  $('.form-background').removeClass('hidden');
  $('.form.enter-phone').removeClass('hidden');
  $('.form.enter-code').addClass('hidden');
  $('.page.extra-life').addClass('hidden');
}

function showCodeForm() {
  $('.form-background').removeClass('hidden');
  $('.form.enter-phone').addClass('hidden');
  $('.form.enter-code').removeClass('hidden');
}

function showExtraLifeMessage() {
  $('.form-background').addClass('hidden');
  $('.form.enter-phone').addClass('hidden');
  $('.form.enter-code').addClass('hidden');
  $('.page.extra-life').removeClass('hidden');
  
  $('.page.extra-life .message.waiting').removeClass('hidden');
  $('.page.extra-life .message.success').addClass('hidden');
  $('.page.extra-life .message.error').addClass('hidden');
}


function submitPhone() {
  const phone = $('.form.enter-phone .field').val().replace(/\D/g, '');
  $('.form.enter-phone .submit').attr('disabled', true);

  $.post('https://api-quiz.hype.space/verifications', {
    method: 'sms',
    phone: '+1' + phone
  }).then(res => {
    $('.form.enter-phone .submit').attr('disabled', null);
    $('.form.enter-phone .error').addClass('ghost');

    verificationId = res.verificationId;
    showCodeForm();
  }).catch(err => {
    $('.form.enter-phone .submit').attr('disabled', null);
    if (err.responseJSON) {
      $('.form.enter-phone .error').text(err.responseJSON.error);
    }
    $('.form.enter-phone .error').removeClass('ghost');
  });
}

function submitCode() {
  const code = $('.form.enter-code .field').val();
  
  $.post('https://api-quiz.hype.space/verifications/' + verificationId, {
    code: code
  }).then(res => {
    $('.form.enter-code .submit').attr('disabled', null);
    $('.form.enter-code .error').addClass('ghost');

    const accessToken = res.auth.accessToken;
    if ($('input#remember')[0].checked) {
      saveAccessToken(accessToken);
    }
    showExtraLifeMessage();
    getExtraLife(accessToken);
  }).catch(err => {
    $('.form.enter-code .submit').attr('disabled', null);
    if (err.responseJSON) {
      $('.form.enter-code .error').text(err.responseJSON.error);
    }
    $('.form.enter-code .error').removeClass('ghost');
  });
}

function getExtraLife(accessToken) {
  const minTime = 1500;
  const start = Date.now();

  $.post({
    url: 'https://api-quiz.hype.space/easter-eggs/makeItRain',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  }).then(res => {
    const diff = minTime - (Date.now() - start);
    
    setTimeout(() => {
      $('.page.extra-life .message.waiting').addClass('hidden');
      $('.page.extra-life .message.success').removeClass('hidden');
      $('.page.extra-life .message.error').addClass('hidden');
    }, diff);
  }).catch(err => {
    const diff = minTime - (Date.now() - start);

    setTimeout(() => {
      $('.page.extra-life .message.waiting').addClass('hidden');
      $('.page.extra-life .message.success').addClass('hidden');
      $('.page.extra-life .message.error').removeClass('hidden');
    }, diff);
  });
}


function saveAccessToken(accessToken) {
  Cookies.set('hqAccessToken', accessToken);
}

function clearAccessToken() {
  Cookies.remove('hqAccessToken');
}

function checkAccessToken() {
  return Cookies.get('hqAccessToken');
}

