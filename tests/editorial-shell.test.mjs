import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const shell = fs.readFileSync(new URL('../cms/public/editorial/index.html', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../cms/public/editorial/portal.css', import.meta.url), 'utf8');
const portalScript = fs.readFileSync(new URL('../cms/public/editorial/portal.js', import.meta.url), 'utf8');

test('editorial shell exposes an office-like document workspace', () => {
  for (const selector of ['editor-toolbar', 'document-canvas', 'autosave-status', 'editor-panel-tabs', 'editor-sidebar', 'permalink-preview', 'word-count', 'document-save-status']) {
    assert.match(shell, new RegExp(`id="${selector}"`));
  }
  for (const command of ['undo', 'redo', 'bold', 'italic', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight', 'link', 'unlink', 'quote', 'image', 'download']) {
    assert.match(shell, new RegExp(`data-command="${command}"`));
  }
  assert.match(shell, /id="text-style"/);
  assert.match(portalScript, /editor\.contentEditable\s*=\s*'true'/);
  assert.match(portalScript, /permalink-preview/);
  assert.match(portalScript, /word-count/);
});

test('editorial shell keeps every daily view in the full-bleed workspace', () => {
  for (const view of ['login-view', 'portal-view', 'dashboard-view', 'publications-view', 'new-view', 'media-view']) {
    assert.match(shell, new RegExp(`id="${view}"`));
  }
  assert.match(styles, /\.login-card\[hidden\], #portal-view\[hidden\], \.view\[hidden\]/);
  assert.match(styles, /\.editor-sidebar\s*\{[^}]*border-left:\s*1px/);
  assert.match(shell, /class="editor-main"[\s\S]*class="editor-footer"[\s\S]*<\/div>\s*<\/div>\s*<aside id="editor-sidebar"/);
  assert.match(styles, /\.editor-workspace > \*, \.topbar > \*, \.page-heading > \*/);
  assert.match(styles, /\.row-actions\s*\{[^}]*flex-wrap:\s*wrap/);
  assert.match(styles, /\.sidebar\s*\{[^}]*position:\s*fixed[^}]*height:\s*calc\(100dvh - 76px\)/);
  assert.match(styles, /\.layout\s*\{[^}]*display:\s*block[^}]*padding-left:\s*240px/);
  assert.match(styles, /\.topbar\s*\{[^}]*position:\s*fixed[^}]*inset:\s*0 0 auto[^}]*z-index:\s*20/);
  assert.match(styles, /\.layout\s*\{[^}]*padding-top:\s*76px[^}]*padding-left:\s*240px/);
  assert.match(styles, /\.sidebar\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/);
  assert.match(styles, /\.help\s*\{[^}]*margin:\s*auto 8px 0[^}]*border-top:\s*1px/);
  assert.match(styles, /\.topbar\s*\{[^}]*position:\s*sticky[^}]*flex-wrap:\s*wrap/);
  assert.match(styles, /\.sidebar\s*\{[^}]*position:\s*static[^}]*flex-direction:\s*row[^}]*overflow-x:\s*auto/);
});

test('editorial shell has responsive document workspace styles', () => {
  assert.match(styles, /\.document-canvas/);
  assert.match(styles, /\.editor-sidebar/);
  assert.match(styles, /\.editor-panel-view\[hidden\]\s*\{\s*display:\s*none/);
  assert.match(styles, /\.content\s*\{[^}]*width:\s*100%/);
  assert.match(styles, /\.panel\s*\{[^}]*border-radius:\s*0/);
  assert.match(styles, /\.editor-main\s*\{[^}]*background:\s*transparent/);
  assert.match(styles, /\.login-card\[hidden\].*#portal-view\[hidden\].*\.view\[hidden\]/);
  assert.match(styles, /@media \(max-width: 720px\)/);
  assert.match(styles, /prefers-color-scheme: dark/);
  assert.match(styles, /\.rich-editor\s*\{[^}]*min-height:\s*420px[^}]*font-size:\s*17px/);
  assert.match(styles, /\.document-canvas\s*\{[^}]*background:\s*var\(--strapi-white\)/);
  assert.match(styles, /\.document-statusbar\s*\{/);
  assert.match(styles, /\.rich-text-card \.block-header\s*\{[^}]*display:\s*none/);
});
