import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port = 4175;
const env = { ...process.env, PORT: String(port), CMS_URL: 'http://127.0.0.1:1', CMS_TIMEOUT_MS: '100' };
for (const key of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'CONTACT_TO']) delete env[key];
const server = spawn(process.execPath, ['server/index.mjs'], {
  cwd: process.cwd(),
  env,
  stdio: 'ignore',
});

async function get(path) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try { return await fetch(`http://127.0.0.1:${port}${path}`); } catch { await new Promise((resolve) => setTimeout(resolve, 100)); }
  }
  throw new Error('server did not start');
}

async function post(path, body) {
  return fetch(`http://127.0.0.1:${port}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

after(() => server.kill());

test('production server exposes safe health and published-only editorial fallbacks', async () => {
  const health = await get('/health');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).ok, true);

  const api = await get('/api/publications?locale=en');
  assert.equal(api.status, 200);
  assert.deepEqual((await api.json()).items, []);

  const perspectives = await get('/en/perspectives/');
  assert.equal(perspectives.status, 200);
  assert.match(await perspectives.text(), /New publications will appear here|editorial area is temporarily unavailable/);

  const missing = await get('/en/perspectives/not-published/');
  assert.equal(missing.status, 404);

  const validWithoutSmtp = await post('/api/contact', { name: 'Test Visitor', email: 'visitor@example.com', subject: 'A valid request', message: 'This message is long enough for validation.', language: 'en' });
  assert.equal(validWithoutSmtp.status, 503);
  assert.deepEqual(await validWithoutSmtp.json(), { ok: false, code: 'mail_not_configured' });

  const invalid = await post('/api/contact', { name: '', email: 'invalid', subject: '', message: 'short', language: 'fr' });
  assert.equal(invalid.status, 400);
  assert.deepEqual(await invalid.json(), { ok: false, code: 'invalid_input' });

  const honeypot = await post('/api/contact', { name: 'Bot', email: 'bot@example.com', subject: 'Bot', message: 'ignored', honeypot: 'filled', language: 'fr' });
  assert.equal(honeypot.status, 200);
  assert.deepEqual(await honeypot.json(), { ok: true });
});
