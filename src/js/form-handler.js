/**
 * Ball Transfer Systems — Form Handler
 * Intercepts contact-form and quote-form submissions,
 * adds spam protection, and POSTs to /api/submit-lead.
 */
(function () {
  'use strict';

  const API_URL = '/api/submit-lead';
  const PAGE_LOAD_TIME = Date.now();
  const SPAM_TOKEN = generateToken();

  // --- Initialization ---
  document.addEventListener('DOMContentLoaded', function () {
    injectHoneypots();
    bindForm('contact-form', 'contact');
    bindForm('quote-form', 'quote_request');
  });

  // --- Generate a simple spam token ---
  function generateToken() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 24; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // --- Inject honeypot fields into forms ---
  function injectHoneypots() {
    document.querySelectorAll('#contact-form, #quote-form').forEach(function (form) {
      var hp = document.createElement('div');
      hp.style.cssText = 'position:absolute;left:-9999px;top:-9999px;height:0;width:0;overflow:hidden;';
      hp.setAttribute('aria-hidden', 'true');
      hp.innerHTML = '<input type="text" name="website_url" tabindex="-1" autocomplete="off">';
      form.appendChild(hp);
    });
  }

  // --- Bind form submission ---
  function bindForm(formId, formType) {
    var form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Run existing inline validation first
      if (!validateForm(form, formType)) return;

      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.textContent;

      // Loading state
      btn.disabled = true;
      btn.textContent = 'Sending...';

      // Collect form data
      var formData = new FormData(form);
      var payload = {};
      formData.forEach(function (value, key) {
        payload[key] = value;
      });

      // Add metadata
      payload.formType = formType;
      payload.pageUrl = window.location.href;
      payload._loadTime = PAGE_LOAD_TIME;
      payload._token = SPAM_TOKEN;

      // UTM params
      var params = new URLSearchParams(window.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (key) {
        if (params.get(key)) payload[key] = params.get(key);
      });

      // POST to API
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json().then(function (data) {
              throw new Error(data.error || 'Something went wrong.');
            });
          }
          return res.json();
        })
        .then(function () {
          form.reset();
          showMessage(form, 'success',
            formType === 'quote_request'
              ? 'Thank you for your quote request! A Ball Transfer Systems representative will contact you shortly.'
              : 'Thank you for your message! We will get back to you soon.'
          );
        })
        .catch(function (err) {
          showMessage(form, 'error', err.message || 'Something went wrong. Please try again.');
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = originalText;
        });
    });
  }

  // --- Validation (mirrors existing inline logic) ---
  function validateForm(form, formType) {
    var isValid = true;

    // Clear previous errors
    form.querySelectorAll('.form-error').forEach(function (el) { el.remove(); });
    form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(function (el) {
      el.style.borderColor = '';
    });

    if (formType === 'contact') {
      var name = form.querySelector('#name');
      var email = form.querySelector('#email');
      var message = form.querySelector('#message');

      if (!name.value.trim()) { showError(name, 'Please enter your name'); isValid = false; }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) {
        showError(email, 'Please enter your email'); isValid = false;
      } else if (!emailRegex.test(email.value)) {
        showError(email, 'Please enter a valid email address'); isValid = false;
      }

      if (!message.value.trim()) { showError(message, 'Please enter a message'); isValid = false; }
    }

    if (formType === 'quote_request') {
      var requiredFields = ['name', 'job-title', 'company', 'phone', 'email', 'product', 'timeline'];
      requiredFields.forEach(function (fieldId) {
        var field = form.querySelector('#' + fieldId);
        if (field && !field.value.trim()) {
          showError(field, 'This field is required');
          isValid = false;
        }
      });

      var qEmail = form.querySelector('#email');
      var qEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (qEmail.value.trim() && !qEmailRegex.test(qEmail.value)) {
        showError(qEmail, 'Please enter a valid email address');
        isValid = false;
      }

      var phone = form.querySelector('#phone');
      if (phone.value.trim() && phone.value.replace(/\D/g, '').length < 10) {
        showError(phone, 'Please enter a valid phone number');
        isValid = false;
      }
    }

    return isValid;
  }

  function showError(input, message) {
    input.style.borderColor = '#dc2626';
    var error = document.createElement('div');
    error.className = 'form-error';
    error.style.cssText = 'color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem;';
    error.textContent = message;
    input.parentNode.appendChild(error);
  }

  // --- Show inline success/error message ---
  function showMessage(form, type, text) {
    // Remove any existing message
    var existing = form.parentNode.querySelector('.form-message');
    if (existing) existing.remove();

    var msg = document.createElement('div');
    msg.className = 'form-message form-message--' + type;

    if (type === 'success') {
      msg.style.cssText = 'background: #ecfdf5; border: 1px solid #10b981; color: #065f46; padding: 16px; border-radius: 8px; margin-top: 16px; font-size: 0.95rem;';
    } else {
      msg.style.cssText = 'background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; padding: 16px; border-radius: 8px; margin-top: 16px; font-size: 0.95rem;';
    }

    msg.textContent = text;
    form.parentNode.insertBefore(msg, form.nextSibling);

    // Auto-dismiss after 8 seconds
    setTimeout(function () {
      if (msg.parentNode) msg.remove();
    }, 8000);
  }
})();
