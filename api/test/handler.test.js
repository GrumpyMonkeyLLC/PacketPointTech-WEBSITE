const test = require('node:test');
const assert = require('node:assert');

// Stub the Azure SDKs so the handler can run outside the Functions runtime.
let handler;
let sent = [];
let sendStatus = 'Succeeded';
require.cache[require.resolve('@azure/functions')] = {
  exports: { app: { http: (_name, opts) => { handler = opts.handler; } } },
};
require.cache[require.resolve('@azure/communication-email')] = {
  exports: {
    EmailClient: class {
      async beginSend(msg) { sent.push(msg); return { pollUntilDone: async () => ({ status: sendStatus }) }; }
    },
  },
};
require('../src/functions/contact');

const ctx = { error: () => {} };
const req = (body) => ({ json: async () => body });
const good = { name: 'Jane', company: 'Acme', email: 'jane@acme.com', message: 'Hi', 'h-captcha-response': 'tok' };

let captchaOk = true;
global.fetch = async () => ({ ok: true, json: async () => ({ success: captchaOk }) });

test.beforeEach(() => {
  sent = []; sendStatus = 'Succeeded'; captchaOk = true;
  Object.assign(process.env, { ACS_CONNECTION_STRING: 'x', EMAIL_SENDER: 'DoNotReply@example.com', CONTACT_TO: 'owner@example.com', HCAPTCHA_SECRET: 's' });
});

test('sends a valid submission with reply-to set to the visitor', async () => {
  const res = await handler(req(good), ctx);
  assert.equal(res.status, 200);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].senderAddress, 'DoNotReply@example.com');
  assert.deepEqual(sent[0].recipients.to, [{ address: 'owner@example.com' }]);
  assert.deepEqual(sent[0].replyTo, [{ address: 'jane@acme.com', displayName: 'Jane' }]);
});

test('honeypot submissions are silently dropped', async () => {
  const res = await handler(req({ ...good, botcheck: 'on' }), ctx);
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
});

test('failed captcha is rejected', async () => {
  captchaOk = false;
  const res = await handler(req(good), ctx);
  assert.equal(res.status, 400);
  assert.equal(sent.length, 0);
});

test('invalid input is rejected', async () => {
  const res = await handler(req({ ...good, email: 'bad' }), ctx);
  assert.equal(res.status, 400);
});

test('missing configuration returns 500', async () => {
  delete process.env.HCAPTCHA_SECRET;
  const res = await handler(req(good), ctx);
  assert.equal(res.status, 500);
});

test('send failure returns 502', async () => {
  sendStatus = 'Failed';
  const res = await handler(req(good), ctx);
  assert.equal(res.status, 502);
});
