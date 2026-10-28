// Theme: follows the system setting unless the visitor picks one.
// The saved choice is applied early by an inline script in <head>.
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function currentTheme() {
  const set = root.getAttribute('data-theme');
  if (set) return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('ppt-theme', next); } catch (_) {}
  });
}

// Mobile menu
const menuBtn = document.getElementById('menu-btn');
const navLinks = document.getElementById('nav-links');
if (menuBtn && navLinks) {
  const setOpen = (open) => {
    navLinks.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
  };
  menuBtn.addEventListener('click', () => setOpen(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
}

// Contact form (Web3Forms + hCaptcha)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const CONTACT_EMAIL = 'support@packetpointtechnologies.com';
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
    data.service = value('service') || 'Not sure yet';

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
      setStatus("Thanks, your message was sent. We'll be in touch soon.", 'success');
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus(`Sorry, something went wrong. Please email us directly at ${CONTACT_EMAIL}.`, 'error');
    } finally {
      if (window.hcaptcha) { try { window.hcaptcha.reset(); } catch (_) {} }
      submitBtn.disabled = false;
    }
  });
}
