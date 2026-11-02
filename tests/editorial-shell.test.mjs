import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const shell = fs.readFileSync(new URL('../cms/public/editorial/index.html', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../cms/public/editorial/portal.css', import.meta.url), 'utf8');

test('editorial shell exposes an office-like document workspace', () => {
  for (const selector of ['editor-toolbar', 'document-canvas', 'autosave-status', 'editor-panel-tabs', 'editor-sidebar']) {
    assert.match(shell, new RegExp(`id="${selector}"`));
  }
  for (const command of ['bold', 'italic', 'bullet-list', 'link', 'quote', 'image', 'download']) {
    assert.match(shell, new RegExp(`data-command="${command}"`));
  }
});

test('editorial shell has responsive document workspace styles', () => {
  assert.match(styles, /\.document-canvas/);
  assert.match(styles, /\.editor-sidebar/);
  assert.match(styles, /\.editor-panel-view\[hidden\]\s*\{\s*display:\s*none/);
  assert.match(styles, /@media \(max-width: 720px\)/);
  assert.match(styles, /prefers-color-scheme: dark/);
});
