import test from 'node:test';
import assert from 'node:assert/strict';
import { publicationTypeLabel, publicationStatusLabel, normalizePortalSummary, slugifyPublicationTitle } from '../cms/src/plugins/editorial-portal/shared/publication.mjs';

test('portal labels publication formats in plain French', () => {
  assert.equal(publicationTypeLabel('article'), 'Article');
  assert.equal(publicationTypeLabel('study'), 'Étude / rapport');
  assert.equal(publicationTypeLabel('case-study'), 'Étude de cas');
});

test('portal exposes a safe status label for editorial actions', () => {
  assert.equal(publicationStatusLabel('draft'), 'Brouillon');
  assert.equal(publicationStatusLabel('published'), 'Publié');
  assert.equal(publicationStatusLabel('translation-missing'), 'Traduction anglaise à créer');
});

test('portal summary strips technical fields and preserves translation state', () => {
  const summary = normalizePortalSummary({ documentId: 'doc-1', locale: 'fr', title: 'Article local', slug: 'article-local', editorialType: 'article', publishedAt: null, updatedAt: '2026-11-02T10:00:00Z', localizations: [{ locale: 'en', slug: 'local-article', publishedAt: null }] });
  assert.deepEqual(summary, { documentId: 'doc-1', locale: 'fr', title: 'Article local', slug: 'article-local', type: 'article', status: 'draft', translationStatus: 'missing', updatedAt: '2026-11-02T10:00:00Z' });
  assert.equal('draftSecret' in summary, false);
});

test('creates stable editorial slugs from French titles', () => {
  assert.equal(slugifyPublicationTitle('L’Afrique & la transition numérique'), 'l-afrique-et-la-transition-numerique');
});
