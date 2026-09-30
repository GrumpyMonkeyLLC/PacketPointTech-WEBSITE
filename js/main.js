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

// ── Contact form ──────────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const CONTACT_EMAIL = 'packetpointtechnologies@gmail.com';
  const status = document.getElementById('form-status');
  const setStatus = (msg, type) => {
    status.textContent = msg;
    status.className = 'form-status' + (type ? ' ' + type : '');
  };

  contactForm.addEventListener('input', (e) => e.target.classList.remove('invalid'));

  contactForm.addEventListener('submit', (e) => {
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

    const name = value('name');
    const company = value('company');
    const service = value('service') || 'Not specified';
    const subject = `Consultation request: ${name}${company ? ' (' + company + ')' : ''}`;
    const body = [
      `Name: ${name}`,
      `Company: ${company || 'N/A'}`,
      `Email: ${value('email')}`,
      `Service: ${service}`,
      '',
      value('message'),
    ].join('\n');

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus(`Opening your email app… If nothing happens, email us directly at ${CONTACT_EMAIL}.`, 'success');
  });
}
