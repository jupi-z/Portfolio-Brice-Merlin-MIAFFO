import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePublication, renderPublicationBody } from '../server/publications.mjs';

test('normalizes a published Strapi document without exposing draft fields', () => {
  const publication = normalizePublication({
    documentId: 'doc-1',
    locale: 'fr',
    publishedAt: '2026-11-01T10:00:00.000Z',
    title: 'Une étude sûre',
    slug: 'une-etude-sure',
    editorialType: 'study',
    excerpt: 'Résumé public.',
    content: [{ __component: 'publication.rich-text', text: 'Paragraphe public.' }],
    localizations: [{ locale: 'en', slug: 'a-safe-study', publishedAt: '2026-11-01T10:00:00.000Z' }],
    draftSecret: 'must-not-leak',
  });

  assert.equal(publication.slug, 'une-etude-sure');
  assert.equal(publication.locale, 'fr');
  assert.equal(publication.status, 'published');
  assert.equal('draftSecret' in publication, false);
  assert.deepEqual(publication.translations, [{ locale: 'en', slug: 'a-safe-study', publishedAt: '2026-11-01T10:00:00.000Z' }]);
});

test('renders structured blocks as escaped safe HTML', () => {
  const html = renderPublicationBody([
    { __component: 'publication.heading', level: 'h2', text: '<script>alert(1)</script>' },
    { __component: 'publication.rich-text', text: 'Une ligne\nUne autre ligne.' },
    { __component: 'publication.quote', text: 'Une citation', attribution: 'Brice Miaffo' },
  ]);

  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /Une ligne<br\/>Une autre ligne\./);
  assert.match(html, /Brice Miaffo/);
});
