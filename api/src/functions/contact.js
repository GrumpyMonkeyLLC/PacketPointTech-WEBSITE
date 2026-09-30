const { app } = require('@azure/functions');
const { EmailClient } = require('@azure/communication-email');
const { validate, buildEmail, verifyCaptcha } = require('../contact');

let emailClient;
const getEmailClient = () => (emailClient ??= new EmailClient(process.env.ACS_CONNECTION_STRING));

const reply = (status, body) => ({ status, jsonBody: body });

app.http('contact', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'contact',
  handler: async (request, context) => {
    const { ACS_CONNECTION_STRING, EMAIL_SENDER, CONTACT_TO, HCAPTCHA_SECRET } = process.env;
    if (!ACS_CONNECTION_STRING || !EMAIL_SENDER || !CONTACT_TO || !HCAPTCHA_SECRET) {
      context.error('Contact form is missing required app settings.');
      return reply(500, { success: false, message: 'The contact form is not configured.' });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return reply(400, { success: false, message: 'Invalid request.' });
    }

    // Honeypot: real visitors never see or tick this box. Pretend success so bots move on.
    if (body?.botcheck) return reply(200, { success: true });

    const { data, error } = validate(body);
    if (error) return reply(400, { success: false, message: error });

    let human = false;
    try {
      human = await verifyCaptcha(body['h-captcha-response'], HCAPTCHA_SECRET);
    } catch (err) {
      context.error('hCaptcha verification failed:', err);
    }
    if (!human) return reply(400, { success: false, message: 'Captcha verification failed. Please try again.' });

    const { subject, plainText } = buildEmail(data);
    try {
      const poller = await getEmailClient().beginSend({
        senderAddress: EMAIL_SENDER,
        recipients: { to: [{ address: CONTACT_TO }] },
        replyTo: [{ address: data.email, displayName: data.name }],
        content: { subject, plainText },
      });
      const result = await poller.pollUntilDone();
      if (result.status !== 'Succeeded') throw new Error(`Email send status: ${result.status}`);
    } catch (err) {
      context.error('Email send failed:', err);
      return reply(502, { success: false, message: 'Sorry, we could not send your message.' });
    }

    return reply(200, { success: true });
  },
});
