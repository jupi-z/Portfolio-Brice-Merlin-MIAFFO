import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePublication, renderPublicationBody } from '../server/publications.mjs';
import { renderEditorialPage } from '../server/editorial-pages.mjs';

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

test('sanitizes rich editor HTML while preserving safe formatting', () => {
  const html = renderPublicationBody([
    { __component: 'publication.rich-text', text: 'Fallback', html: '<p>Texte <strong>important</strong> <a href="https://example.test">source</a><script>alert(1)</script><img src=x onerror=alert(2)></p>' },
  ]);

  assert.match(html, /<strong>important<\/strong>/);
  assert.match(html, /<a href="https:\/\/example\.test" rel="noopener noreferrer">source<\/a>/);
  assert.doesNotMatch(html, /<script|onerror|<img/);
});

test('rewrites published media to the protected CMS public-media route', () => {
  const publication = normalizePublication({
    documentId: 'doc-media',
    locale: 'fr',
    publishedAt: '2026-11-01T10:00:00.000Z',
    title: 'Publication média',
    slug: 'publication-media',
    editorialType: 'article',
    excerpt: 'Résumé.',
    cover: { id: 42, url: '/uploads/cover.webp' },
    content: [{ __component: 'publication.image', image: { id: 43, url: '/uploads/image.webp' }, alt: 'Image' }],
  });

  assert.match(publication.cover.url, /editorial-portal\/public-media\/42$/);
  assert.match(publication.content[0].image.url, /editorial-portal\/public-media\/43$/);
});

test('escapes JSON-LD script breakers', () => {
  const html = renderEditorialPage({ lang: 'fr', pageTitle: 'Titre', description: 'Description', canonical: 'https://example.test/fr/', body: '<main id="main"></main>', jsonLd: { name: '</script><script>alert(1)</script>' } });
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /\\u003c\/script>/);
});
