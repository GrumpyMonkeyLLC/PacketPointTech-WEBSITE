// Pure helpers for the contact endpoint, kept separate so they can be unit tested.

const LIMITS = { name: 100, company: 150, email: 254, service: 100, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Collapse whitespace (including CR/LF) so values are safe in single-line headers.
const oneLine = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

function validate(body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid request.' };

  const data = {
    name: oneLine(body.name),
    company: oneLine(body.company),
    email: oneLine(body.email),
    service: oneLine(body.service) || 'Not specified',
    message: String(body.message ?? '').trim(),
  };

  if (!data.name || !data.email || !data.message) {
    return { error: 'Please fill in your name, email, and message.' };
  }
  if (!EMAIL_RE.test(data.email)) return { error: 'Please enter a valid email address.' };
  for (const [key, max] of Object.entries(LIMITS)) {
    if (data[key].length > max) return { error: `The ${key} field is too long.` };
  }
  return { data };
}

function buildEmail(data) {
  const subject = `Consultation request: ${data.name}${data.company ? ` (${data.company})` : ''}`;
  const plainText = [
    `Name: ${data.name}`,
    `Company: ${data.company || 'N/A'}`,
    `Email: ${data.email}`,
    `Service: ${data.service}`,
    '',
    data.message,
    '',
    '-- Sent from the packetpointtechnologies website contact form',
  ].join('\n');
  return { subject, plainText };
}

async function verifyCaptcha(token, secret, fetchImpl = fetch) {
  if (!token) return false;
  const params = new URLSearchParams({ secret, response: token });
  const res = await fetchImpl('https://api.hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  if (!res.ok) return false;
  const json = await res.json();
  return json.success === true;
}

module.exports = { validate, buildEmail, verifyCaptcha };
