import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const mailpit = process.env.MAILPIT_URL || 'http://127.0.0.1:8025';
const port = 4178;
const env = {
  ...process.env,
  PORT: String(port),
  PUBLIC_SITE_URL: `http://127.0.0.1:${port}`,
  ALLOWED_ORIGIN: `http://127.0.0.1:${port}`,
  CMS_URL: 'http://127.0.0.1:1',
  SMTP_PROVIDER: 'mailpit', SMTP_HOST: '127.0.0.1', SMTP_PORT: '1025',
  SMTP_SECURE: 'false', SMTP_REQUIRE_TLS: 'false', SMTP_TLS_REJECT_UNAUTHORIZED: 'true',
  SMTP_FROM: 'portfolio-local@example.test', CONTACT_TO: 'qa-inbox@example.test',
};

const request = async (url, options) => fetch(url, options);
const clear = async () => { const response = await request(`${mailpit}/api/v1/messages`, { method: 'DELETE' }); assert.equal(response.ok, true); };
const waitFor = async (url, attempts = 30) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { const response = await request(url); if (response.ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Serveur non disponible: ${url}`);
};

const mailpitResponse = await request(`${mailpit}/api/v1/messages`);
assert.equal(mailpitResponse.ok, true, 'Mailpit doit être démarré par Docker Compose');
await clear();
const server = spawn(process.execPath, ['server/index.mjs'], { env, stdio: 'ignore' });
try {
  await waitFor(`http://127.0.0.1:${port}/health`);
  for (const payload of [
    { language: 'fr', name: 'Élodie QA', email: 'elodie.qa@example.test', subject: 'Test FR', message: 'Message local français suffisamment long.' },
    { language: 'en', name: 'QA Visitor', email: 'qa.visitor@example.test', subject: 'Test EN', message: 'Local English message sufficiently long.' },
  ]) {
    const response = await request(`http://127.0.0.1:${port}/api/contact`, { method: 'POST', headers: { 'content-type': 'application/json', origin: `http://127.0.0.1:${port}` }, body: JSON.stringify(payload) });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  }
  const messages = await (await request(`${mailpit}/api/v1/messages`)).json();
  assert.equal(messages.messages.length, 2);
  assert.ok(messages.messages.some((message) => message.Subject.includes('Test FR')));
  assert.ok(messages.messages.some((message) => message.Subject.includes('Test EN')));
  await clear();
  console.log('OK: SMTP local FR/EN captured by Mailpit and cleaned up.');
} finally {
  server.kill();
}
