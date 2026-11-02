import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port = 4175;
const server = spawn(process.execPath, ['server/index.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port), CMS_URL: 'http://127.0.0.1:1', CMS_TIMEOUT_MS: '100' },
  stdio: 'ignore',
});

async function get(path) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try { return await fetch(`http://127.0.0.1:${port}${path}`); } catch { await new Promise((resolve) => setTimeout(resolve, 100)); }
  }
  throw new Error('server did not start');
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
});
