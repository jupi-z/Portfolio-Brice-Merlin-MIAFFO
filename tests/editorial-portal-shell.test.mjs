import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('simplified editorial portal ships as an independent Strapi-served shell', async () => {
  const html = await readFile(new URL('../cms/public/editorial/index.html', import.meta.url), 'utf8');
  const css = await readFile(new URL('../cms/public/editorial/portal.css', import.meta.url), 'utf8');
  const js = await readFile(new URL('../cms/public/editorial/portal.js', import.meta.url), 'utf8');
  assert.match(html, /id="login-view"/);
  assert.match(html, /id="publication-form"/);
  assert.match(html, /Administration technique/);
  assert.match(css, /--strapi-primary/);
  assert.match(js, /\/admin\/login/);
  assert.match(js, /content-manager\/collection-types/);
  assert.doesNotMatch(js, /BriceLocalQA2026|SMTP_PASS|ADMIN_JWT_SECRET/);
});
