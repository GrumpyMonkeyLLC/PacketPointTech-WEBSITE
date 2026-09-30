const test = require('node:test');
const assert = require('node:assert');
const { validate, buildEmail, verifyCaptcha } = require('../src/contact');

const good = { name: 'Jane', company: 'Acme', email: 'jane@acme.com', service: 'Managed IT Services', message: 'Help\nplease' };

test('accepts a valid submission', () => {
  const { data, error } = validate(good);
  assert.equal(error, undefined);
  assert.equal(data.message, 'Help\nplease');
});

test('rejects missing required fields and bad email', () => {
  assert.ok(validate({ ...good, name: '' }).error);
  assert.ok(validate({ ...good, message: '   ' }).error);
  assert.ok(validate({ ...good, email: 'nope' }).error);
  assert.ok(validate(null).error);
});

test('rejects oversized fields', () => {
  assert.ok(validate({ ...good, message: 'x'.repeat(5001) }).error);
});

test('strips newlines from header-bound fields', () => {
  const { data } = validate({ ...good, name: 'Jane\r\nBcc: evil@x.com' });
  assert.equal(data.name, 'Jane Bcc: evil@x.com');
  assert.ok(!buildEmail(data).subject.includes('\n'));
});

test('defaults service and builds subject', () => {
  const { data } = validate({ ...good, service: '', company: '' });
  const email = buildEmail(data);
  assert.equal(email.subject, 'Consultation request: Jane');
  assert.match(email.plainText, /Service: Not specified/);
});

test('verifyCaptcha checks token and response', async () => {
  const fake = (success) => async (url, opts) => {
    assert.equal(url, 'https://api.hcaptcha.com/siteverify');
    assert.match(String(opts.body), /secret=s&response=t/);
    return { ok: true, json: async () => ({ success }) };
  };
  assert.equal(await verifyCaptcha('', 's', fake(true)), false);
  assert.equal(await verifyCaptcha('t', 's', fake(true)), true);
  assert.equal(await verifyCaptcha('t', 's', fake(false)), false);
});
