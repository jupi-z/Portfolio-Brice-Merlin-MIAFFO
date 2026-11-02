import assert from 'node:assert/strict';
import test from 'node:test';
import { estimateReadingTime, normalizeEditorBlock, serializeEditorBlocks, slugifyTitle, suggestSeo } from '../cms/public/editorial/editor-utils.mjs';

test('slugifyTitle creates an accented, stable editorial slug', () => {
  assert.equal(slugifyTitle('Économie & développement durable'), 'economie-et-developpement-durable');
});

test('estimateReadingTime counts words from structured blocks', () => {
  const blocks = [{ __component: 'publication.rich-text', text: `${'mot '.repeat(399)}fin` }];
  assert.equal(estimateReadingTime(blocks), 2);
});

test('suggestSeo derives bounded metadata from title and excerpt', () => {
  const result = suggestSeo({
    title: 'Une publication professionnelle sur la transformation des organisations',
    excerpt: 'Un résumé clair qui explique le sujet et la valeur pratique de cette publication.',
  });
  assert.equal(result.metaTitle.length <= 60, true);
  assert.equal(result.metaDescription.length <= 160, true);
  assert.match(result.metaTitle, /transformation/);
  assert.match(result.metaDescription, /résumé clair/);
});

test('normalizeEditorBlock converts API tables and media to editor state', () => {
  assert.deepEqual(normalizeEditorBlock({ __component: 'publication.table', caption: 'Données', headers: ['Année', 'Valeur'], rows: [['2026', '10']] }), {
    __component: 'publication.table', caption: 'Données', headers: 'Année | Valeur', rows: '2026 | 10',
  });
  assert.deepEqual(normalizeEditorBlock({ __component: 'publication.image', image: { id: 7 }, alt: 'Portrait' }), {
    __component: 'publication.image', image: { id: 7 }, alt: 'Portrait', mediaId: 7,
  });
});

test('serializeEditorBlocks preserves structured block contracts', () => {
  assert.deepEqual(serializeEditorBlocks([
    { __component: 'publication.rich-text', text: 'Texte', html: '<p><strong>Texte</strong></p>' },
    { __component: 'publication.image', mediaId: '7', alt: 'Illustration', caption: 'Légende' },
    { __component: 'publication.table', caption: 'Tableau', headers: 'A | B', rows: '1 | 2\n3 | 4' },
  ]), [
    { __component: 'publication.rich-text', text: 'Texte', html: '<p><strong>Texte</strong></p>' },
    { __component: 'publication.image', image: 7, alt: 'Illustration', caption: 'Légende' },
    { __component: 'publication.table', caption: 'Tableau', headers: ['A', 'B'], rows: [['1', '2'], ['3', '4']] },
  ]);
});
