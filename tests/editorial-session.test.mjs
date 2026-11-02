import test from 'node:test';
import assert from 'node:assert/strict';
import { EDITORIAL_ACCESS_COOKIE, createEditorialCookieOptions, readCookieToken } from '../cms/src/plugins/editorial-portal/session.js';

test('editorial access cookie is HttpOnly and scoped to the whole portal origin', () => {
  const options = createEditorialCookieOptions(false, 900);
  assert.equal(EDITORIAL_ACCESS_COOKIE, 'brice_editorial_access');
  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, 'lax');
  assert.equal(options.path, '/');
  assert.equal(options.maxAge, 900000);
  assert.equal(options.secure, false);
});

test('editorial token is read only from the request cookie header', () => {
  assert.equal(readCookieToken('foo=bar; brice_editorial_access=abc123; other=x'), 'abc123');
  assert.equal(readCookieToken('foo=bar'), null);
  assert.equal(readCookieToken('brice_editorial_access=%E0%A4%A'), null);
});
