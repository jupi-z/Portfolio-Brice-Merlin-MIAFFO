import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('simplified editorial portal ships as an independent Strapi-served shell', async () => {
  const html = await readFile(new URL('../cms/public/editorial/index.html', import.meta.url), 'utf8');
  const css = await readFile(new URL('../cms/public/editorial/portal.css', import.meta.url), 'utf8');
  const js = await readFile(new URL('../cms/public/editorial/portal.js', import.meta.url), 'utf8');
  const preview = await readFile(new URL('../cms/public/editorial/preview.js', import.meta.url), 'utf8');
  assert.match(html, /id="login-view"/);
  assert.match(html, /id="publication-form"/);
  assert.doesNotMatch(html, /Administration technique/);
  assert.match(css, /--strapi-primary/);
  assert.doesNotMatch(js, /\/admin\/login/);
  assert.match(js, /editorial-portal\/session/);
  assert.match(js, /editorial-portal\/media/);
  assert.match(js, /editorial\/preview\.html/);
  assert.match(html, /data-add-block="table"/);
  assert.doesNotMatch(js, /payload\.data\.title = ''/);
  assert.match(js, /credentials:\s*'include'/);
  assert.match(preview, /editorial-portal\/preview/);
  assert.doesNotMatch(js, /sessionStorage|localStorage/);
  assert.doesNotMatch(js, /BriceLocalQA2026|SMTP_PASS|ADMIN_JWT_SECRET/);
});
