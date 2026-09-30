// ── Theme ─────────────────────────────────────────────────────
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const saved = localStorage.getItem('ppt-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = saved || (prefersDark ? 'dark' : 'light');

// Dark is default — only apply light if explicitly set
if (theme === 'light') root.setAttribute('data-theme', 'light');
updateThemeIcon(theme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    if (next === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('ppt-theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(t) {
  if (!themeToggle) return;
  themeToggle.textContent = t === 'light' ? '🌙' : '☀️';
  themeToggle.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
}

// ── Loader ────────────────────────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 150);
});

// ── Nav scroll ────────────────────────────────────────────────
const header = document.querySelector('header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 16);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Mobile menu ───────────────────────────────────────────────
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
if (menuBtn && mobileNav) {
  menuBtn.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuBtn.textContent = open ? '✕' : '☰';
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuBtn.textContent = '☰';
    });
  });
}

// ── Active nav ────────────────────────────────────────────────
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ── Scroll reveal ─────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Contact form (Web3Forms + hCaptcha) ───────────────────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const CONTACT_EMAIL = 'zach@packetpointtechnologies.com';
  const status = document.getElementById('form-status');
  const submitBtn = contactForm.querySelector('.btn-submit');
  const setStatus = (msg, type) => {
    status.textContent = msg;
    status.className = 'form-status' + (type ? ' ' + type : '');
  };

  contactForm.addEventListener('input', (e) => e.target.classList.remove('invalid'));

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const field = (id) => contactForm.querySelector('#' + id);
    const value = (id) => field(id).value.trim();

    const invalid = ['name', 'email', 'message'].filter(id => !value(id) || !field(id).checkValidity());
    contactForm.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    if (invalid.length) {
      invalid.forEach(id => field(id).classList.add('invalid'));
      field(invalid[0]).focus();
      setStatus('Please fill in your name, a valid email, and a message.', 'error');
      return;
    }

    const data = Object.fromEntries(new FormData(contactForm));
    if (!data['h-captcha-response']) {
      setStatus('Please complete the captcha.', 'error');
      return;
    }

    const name = value('name');
    const company = value('company');
    data.subject = `Consultation request: ${name}${company ? ' (' + company + ')' : ''}`;
    data.service = value('service') || 'Not specified';

    submitBtn.disabled = true;
    setStatus('Sending…');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || `HTTP ${res.status}`);
      contactForm.reset();
      setStatus("Thanks! Your message has been sent. We'll be in touch shortly.", 'success');
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus(`Sorry, something went wrong. Please email us directly at ${CONTACT_EMAIL}.`, 'error');
    } finally {
      if (window.hcaptcha) { try { window.hcaptcha.reset(); } catch (_) {} }
      submitBtn.disabled = false;
    }
  });
}
