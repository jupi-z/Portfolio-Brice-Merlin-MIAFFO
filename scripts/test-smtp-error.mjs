import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port = 4179;
const env = { ...process.env, PORT: String(port), PUBLIC_SITE_URL: `http://127.0.0.1:${port}`, ALLOWED_ORIGIN: `http://127.0.0.1:${port}`, CMS_URL: 'http://127.0.0.1:1', SMTP_PROVIDER: 'mailpit', SMTP_HOST: '127.0.0.1', SMTP_PORT: '19999', SMTP_SECURE: 'false', SMTP_REQUIRE_TLS: 'false', SMTP_CONNECTION_TIMEOUT_MS: '200', SMTP_GREETING_TIMEOUT_MS: '200', SMTP_SOCKET_TIMEOUT_MS: '300', SMTP_FROM: 'portfolio-local@example.test', CONTACT_TO: 'qa-inbox@example.test' };
const server = spawn(process.execPath, ['server/index.mjs'], { env, stdio: 'ignore' });
try {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const response = await fetch(`http://127.0.0.1:${port}/api/contact`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'QA Error', email: 'qa.error@example.test', subject: 'SMTP error', message: 'This message is long enough for validation.', language: 'en' }) });
  assert.equal(response.status, 504);
  assert.deepEqual(await response.json(), { ok: false, code: 'delivery_timeout' });
  console.log('OK: SMTP connection failure returns a non-success response without a false delivery.');
} finally { server.kill(); }
