/**
 * BizFlow — Authentication Controller (auth.js)
 * Supports Sign In & Sign Up tabs, validation, password toggling, strength meter
 */

;(function () {
  'use strict';

  // Elements
  const tabSlider     = document.getElementById('tab-slider');
  const tabLogin      = document.getElementById('tab-login');
  const tabSignup     = document.getElementById('tab-signup');
  const formLogin     = document.getElementById('form-login');
  const formSignup    = document.getElementById('form-signup');
  const cardTitle     = document.getElementById('card-title');
  const cardSubtitle  = document.getElementById('card-subtitle');
  const authCard      = document.getElementById('auth-card');

  const switchToSignup = document.getElementById('switch-to-signup');
  const switchToLogin  = document.getElementById('switch-to-login');

  // SVGs for eye toggles
  const EYE_OPEN = `
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  `;
  const EYE_CLOSED = `
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
      a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4
      c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07
      a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  `;

  // ── 1. Tab Switching Logic ───────────────────────────────────────
  function setMode(mode) {
    if (mode === 'signup') {
      tabSlider.style.transform = 'translateX(100%)';
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      tabSignup.setAttribute('aria-selected', 'true');
      tabLogin.setAttribute('aria-selected', 'false');

      formSignup.classList.add('active');
      formLogin.classList.remove('active');

      cardTitle.textContent = 'Create BizFlow Account';
      cardSubtitle.textContent = 'Start managing your business flow in seconds.';
    } else {
      tabSlider.style.transform = 'translateX(0)';
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      tabLogin.setAttribute('aria-selected', 'true');
      tabSignup.setAttribute('aria-selected', 'false');

      formLogin.classList.add('active');
      formSignup.classList.remove('active');

      cardTitle.textContent = 'Welcome to BizFlow';
      cardSubtitle.textContent = 'One flow. One view. Better decisions.';
    }
  }

  if (tabLogin) tabLogin.addEventListener('click', () => setMode('login'));
  if (tabSignup) tabSignup.addEventListener('click', () => setMode('signup'));
  if (switchToSignup) switchToSignup.addEventListener('click', () => setMode('signup'));
  if (switchToLogin) switchToLogin.addEventListener('click', () => setMode('login'));

  // Check URL query parameters (e.g. login.html?tab=signup)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tab') === 'signup') {
    setMode('signup');
  }

  // ── 2. Password Visibility Toggles ───────────────────────────────
  function setupEyeToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.querySelector('.eye-icon').innerHTML = isHidden ? EYE_CLOSED : EYE_OPEN;
    });
  }

  setupEyeToggle('login-eye', 'login-password');
  setupEyeToggle('signup-eye', 'signup-password');

  // ── 3. Password Strength Meter ───────────────────────────────────
  const signupPwd = document.getElementById('signup-password');
  const strengthFill = document.getElementById('strength-fill');
  const strengthLabel = document.getElementById('strength-label');

  if (signupPwd && strengthFill && strengthLabel) {
    signupPwd.addEventListener('input', () => {
      const val = signupPwd.value;
      if (!val) {
        strengthFill.style.width = '0%';
        strengthLabel.textContent = 'Password strength';
        strengthLabel.style.color = 'var(--text-300)';
        return;
      }

      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (score <= 1) {
        strengthFill.style.width = '30%';
        strengthFill.style.backgroundColor = '#E53935';
        strengthLabel.textContent = 'Weak password';
        strengthLabel.style.color = '#E53935';
      } else if (score === 2 || score === 3) {
        strengthFill.style.width = '65%';
        strengthFill.style.backgroundColor = '#FB8C00';
        strengthLabel.textContent = 'Good password';
        strengthLabel.style.color = '#FB8C00';
      } else {
        strengthFill.style.width = '100%';
        strengthFill.style.backgroundColor = '#00897B';
        strengthLabel.textContent = 'Strong password';
        strengthLabel.style.color = '#00897B';
      }
    });
  }

  // ── 4. Form Validation & Simulation ──────────────────────────────
  function shake() {
    if (!authCard) return;
    authCard.classList.add('shake');
    authCard.addEventListener('animationend', () => authCard.classList.remove('shake'), { once: true });
  }

  // Login submission
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email');
      const pwd = document.getElementById('login-password');
      const submitBtn = document.getElementById('btn-login-submit');

      let isValid = true;
      if (!email.value || !email.value.includes('@')) {
        email.classList.add('error');
        isValid = false;
      } else {
        email.classList.remove('error');
      }

      if (!pwd.value || pwd.value.length < 4) {
        pwd.classList.add('error');
        isValid = false;
      } else {
        pwd.classList.remove('error');
      }

      if (!isValid) {
        shake();
        return;
      }

      // Authenticate & open Dashboard
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      startSession({
        name: email.value.split('@')[0].replace('.', ' ').replace(/^\w/, c => c.toUpperCase()),
        email: email.value,
        business: 'Apex Retail Solutions',
        role: 'Manager',
        isDemo: email.value.includes('demo')
      });

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        window.location.href = 'dashboard.html';
      }, 650);
    });
  }

  // Signup submission
  if (formSignup) {
    formSignup.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name');
      const business = document.getElementById('signup-business');
      const email = document.getElementById('signup-email');
      const pwd = document.getElementById('signup-password');
      const terms = document.getElementById('signup-terms');
      const submitBtn = document.getElementById('btn-signup-submit');

      let isValid = true;

      [name, business, email, pwd].forEach(inp => {
        if (!inp.value.trim()) {
          inp.classList.add('error');
          isValid = false;
        } else {
          inp.classList.remove('error');
        }
      });

      if (!terms.checked) {
        isValid = false;
      }

      if (!isValid) {
        shake();
        return;
      }

      // Register & open Dashboard
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      startSession({
        name: name.value,
        email: email.value,
        business: business.value,
        role: 'Founder',
        isDemo: false
      });

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        window.location.href = 'dashboard.html';
      }, 750);
    });
  }


  // ── 5. Quick Demo Account Login ──────────────────────────────────
  const btnQuickDemo = document.getElementById('btn-quick-demo');

  function startSession(userData) {
    localStorage.setItem('bizflow_session', JSON.stringify({
      name: userData.name || 'Alex Morgan',
      email: userData.email || 'demo@bizflow.com',
      business: userData.business || 'Apex Retail Solutions',
      role: userData.role || 'Business Owner',
      gstin: userData.gstin || '27AABCU9603R1ZM',
      currency: '₹',
      avatar: (userData.name ? userData.name.split(' ').map(n => n[0]).join('') : 'AM').toUpperCase(),
      loggedInAt: new Date().toISOString(),
      isDemo: Boolean(userData.isDemo)
    }));
  }

  if (btnQuickDemo) {
    btnQuickDemo.addEventListener('click', () => {
      const emailInput = document.getElementById('login-email');
      const pwdInput = document.getElementById('login-password');
      const submitBtn = document.getElementById('btn-login-submit');

      // Autofill for visual delight
      if (emailInput) emailInput.value = 'demo@bizflow.com';
      if (pwdInput) pwdInput.value = 'demo1234';

      btnQuickDemo.style.pointerEvents = 'none';
      btnQuickDemo.innerHTML = `
        <span class="demo-sparkle" style="color: #00897B;">✓</span>
        <div class="demo-info">
          <span class="demo-action" style="color: #00695C;">Demo Account Authenticated!</span>
          <span class="demo-meta">Loading Apex Retail workspace...</span>
        </div>
      `;

      startSession({
        name: 'Alex Morgan',
        email: 'demo@bizflow.com',
        business: 'Apex Retail Solutions',
        role: 'Store Owner',
        gstin: '27AABCU9603R1ZM',
        isDemo: true
      });

      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    });
  }

})();