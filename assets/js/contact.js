/* ==========================================================================
   contact.js — inline validation + submission to Web3Forms
   GitHub Pages has no backend, so the form posts to a third-party endpoint.
   Replace WEB3FORMS_KEY below with the real access key (see README).
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var submit = form.querySelector('[type="submit"]');
  var ENDPOINT = 'https://api.web3forms.com/submit';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function fieldOf(input) { return input.closest('.field'); }

  function errorSlot(input) {
    var wrap = fieldOf(input);
    return wrap ? wrap.querySelector('.field__error') : null;
  }

  function setError(input, message) {
    var wrap = fieldOf(input);
    var slot = errorSlot(input);
    if (wrap) wrap.classList.toggle('has-error', !!message);
    if (slot) slot.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  }

  function validate(input) {
    var value = (input.value || '').trim();

    if (input.hasAttribute('required') && !value) {
      return setError(input, 'This field is required.');
    }
    if (input.type === 'email' && value && !EMAIL_RE.test(value)) {
      return setError(input, 'Enter a valid email address.');
    }
    if (input.name === 'message' && value && value.length < 10) {
      return setError(input, 'Please give me a little more detail (10+ characters).');
    }
    return setError(input, '');
  }

  var inputs = form.querySelectorAll('input[required], textarea[required], input[type="email"]');

  Array.prototype.forEach.call(inputs, function (input) {
    // validate on blur, then live-correct once the field has been touched
    input.addEventListener('blur', function () { validate(input); });
    input.addEventListener('input', function () {
      var wrap = fieldOf(input);
      if (wrap && wrap.classList.contains('has-error')) validate(input);
    });
  });

  function show(kind, message) {
    if (!status) return;
    status.className = 'form-status is-shown form-status--' + kind;
    status.textContent = message;
    status.setAttribute('role', kind === 'err' ? 'alert' : 'status');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // honeypot — a filled hidden field means a bot
    var trap = form.querySelector('input[name="botcheck"]');
    if (trap && trap.checked) return;

    var ok = true;
    var firstBad = null;
    Array.prototype.forEach.call(inputs, function (input) {
      if (!validate(input)) {
        ok = false;
        if (!firstBad) firstBad = input;
      }
    });

    if (!ok) {
      show('err', 'Please fix the highlighted fields and try again.');
      if (firstBad) firstBad.focus();
      return;
    }

    var key = form.querySelector('input[name="access_key"]');
    if (!key || !key.value || key.value.indexOf('YOUR-') === 0) {
      show('err',
        'This form is not connected yet. Please email pannasima@gmail.com directly — ' +
        'or see the README for how to add the Web3Forms access key.');
      return;
    }

    if (submit) {
      submit.classList.add('is-loading');
      submit.disabled = true;
    }
    if (status) { status.className = 'form-status'; status.textContent = ''; }

    var data = new FormData(form);
    // collect the service chips into one readable line
    var services = data.getAll('services');
    if (services.length) {
      data.delete('services');
      data.append('services', services.join(', '));
    }

    fetch(ENDPOINT, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    })
      .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, body: j }; }); })
      .then(function (r) {
        if (r.ok && r.body.success) {
          form.reset();
          Array.prototype.forEach.call(form.querySelectorAll('.field.has-error'), function (w) {
            w.classList.remove('has-error');
          });
          show('ok', 'Thank you — your message is on its way. I reply within one business day.');
        } else {
          show('err',
            'Something went wrong sending that. Please email pannasima@gmail.com instead.');
        }
      })
      .catch(function () {
        show('err',
          'Could not reach the server. Please check your connection, or email pannasima@gmail.com.');
      })
      .then(function () {
        if (submit) {
          submit.classList.remove('is-loading');
          submit.disabled = false;
        }
      });
  });
})();
