import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/App.tsx', 'utf8');

assert.match(
  source,
  /domains\.map\(e\s*=>\s*expertiseRow\(e,\s*['"]01['"]\)\)/,
  'home prerender must pass a string expertise selection to expertiseRow',
);
assert.doesNotMatch(
  source,
  /domains\.map\(e\s*=>\s*expertiseRow\(e,\s*e\.num\s*===\s*['"]01['"]\)\)/,
  'home prerender must not pass a boolean expertise selection',
);

console.log('OK: home expertise prerender selection is type-safe.');
