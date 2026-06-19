const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

(function initHeader() {
  const header = $('#header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

(function initMobileMenu() {
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  const closeBtn   = $('#mobile-close');
  const mobileLinks = $$('.mobile-menu__link');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    mobileMenu.removeAttribute('hidden');
    mobileMenu.getBoundingClientRect();
    mobileMenu.classList.add('is-open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    mobileMenu.addEventListener('transitionend', () => {
      if (!mobileMenu.classList.contains('is-open')) {
        mobileMenu.setAttribute('hidden', '');
      }
    }, { once: true });
  }

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  closeBtn && closeBtn.addEventListener('click', closeMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });
})();

(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav__link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const id = entry.target.getAttribute('id');

      navLinks.forEach(link => {
        const matches = link.getAttribute('data-section') === id;
        link.classList.toggle('is-active', matches);
        link.setAttribute('aria-current', matches ? 'page' : 'false');
      });
    });
  }, {
    root: null,
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0,
  });

  sections.forEach(section => observer.observe(section));
})();

(function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.animate-on-scroll').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const animatables = $$('.animate-on-scroll');
  if (!animatables.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.08,
  });

  animatables.forEach(el => observer.observe(el));

  const skillCards = $$('.skill-card');
  skillCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
})();

(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
        10
      ) || 72;

      const targetY = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
})();

(function initContactForm() {
  const form      = $('#contact-form');
  const submitBtn = $('#submit-btn');
  const feedback  = $('#form-feedback');

  if (!form) return;

  const fields = {
    nome:     { el: $('#nome'),     error: $('#nome-error'),     validate: (v) => v.trim().length >= 2    ? null : 'Por favor, insira seu nome.' },
    email:    { el: $('#email'),    error: $('#email-error'),    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Insira um e-mail válido.' },
    assunto:  { el: $('#assunto'),  error: $('#assunto-error'),  validate: (v) => v.trim().length >= 3    ? null : 'Por favor, insira um assunto.' },
    mensagem: { el: $('#mensagem'), error: $('#mensagem-error'), validate: (v) => v.trim().length >= 10   ? null : 'A mensagem deve ter pelo menos 10 caracteres.' },
  };

  Object.values(fields).forEach(({ el }) => {
    if (!el) return;
    el.setAttribute('aria-describedby', el.id + '-error');
    el.addEventListener('input', () => {
      el.classList.toggle('is-filled', el.value.trim().length > 0);
      el.classList.remove('is-error');
      el.removeAttribute('aria-invalid');
    });
    el.addEventListener('blur', () => validateField(el));
  });

  function validateField(inputEl) {
    const field = fields[inputEl.id];
    if (!field) return true;

    const errMsg = field.validate(inputEl.value);
    if (errMsg) {
      field.error.textContent = errMsg;
      inputEl.classList.add('is-error');
      inputEl.classList.remove('is-filled');
      inputEl.setAttribute('aria-invalid', 'true');
      return false;
    }
    field.error.textContent = '';
    inputEl.classList.remove('is-error');
    inputEl.setAttribute('aria-invalid', 'false');
    return true;
  }

  function validateAll() {
    let valid = true;
    Object.values(fields).forEach(({ el }) => {
      if (el && !validateField(el)) valid = false;
    });
    return valid;
  }

  function showFeedback(type, message) {
    feedback.className = 'form-feedback';
    feedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    feedback.textContent = message;
  }

  function hideFeedback() {
    feedback.className = 'form-feedback';
    feedback.textContent = '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideFeedback();

    if (!validateAll()) {
      showFeedback('error', '⚠ Verifique os campos obrigatórios.');
      const firstError = form.querySelector('.is-error');
      if (firstError) firstError.focus();
      return;
    }

    const nome = fields.nome.el.value.trim();
    const email = fields.email.el.value.trim();
    const assunto = fields.assunto.el.value.trim();
    const mensagem = fields.mensagem.el.value.trim();

    const recipient = 'joaohuhuhun@gmail.com';
    const emailSubject = `Contato pelo portfólio: ${assunto}`;
    const emailBody = `Olá, João Vitor.\n\nVocê recebeu uma nova mensagem pelo seu portfólio.\n\nNome: ${nome}\nE-mail para resposta: ${email}\nAssunto: ${assunto}\n\nMensagem:\n${mensagem}`;

    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(recipient)}` +
      `&su=${encodeURIComponent(emailSubject)}` +
      `&body=${encodeURIComponent(emailBody)}`;

    const newWindow = window.open(gmailUrl, '_blank', 'noopener,noreferrer');

    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      const mailtoUrl =
        `mailto:${recipient}` +
        `?subject=${encodeURIComponent(emailSubject)}` +
        `&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoUrl;
    }

    showFeedback('success', '✓ Seu aplicativo de e-mail foi aberto. Revise a mensagem e clique em Enviar.');
    form.reset();
    Object.values(fields).forEach(({ el }) => {
      if (el) {
        el.classList.remove('is-filled', 'is-error');
        el.removeAttribute('aria-invalid');
      }
    });
  });
})();

(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

(function setCurrentYear() {
  const yearEl = $('#current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
