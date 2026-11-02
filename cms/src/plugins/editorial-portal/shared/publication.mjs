const TYPES = {
  article: 'Article',
  study: 'Étude / rapport',
  note: 'Note / point de vue',
  'case-study': 'Étude de cas',
  guide: 'Guide / ressource',
  intervention: 'Intervention / interview',
};

const STATUSES = {
  draft: 'Brouillon',
  published: 'Publié',
  'translation-missing': 'Traduction anglaise à créer',
  archived: 'Archivé',
};

export function publicationTypeLabel(type) {
  return TYPES[type] || 'Publication';
}

export function publicationStatusLabel(status) {
  return STATUSES[status] || 'À vérifier';
}

export function slugifyPublicationTitle(title) {
  return String(title || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizePortalSummary(entry = {}) {
  const localizations = Array.isArray(entry.localizations?.data) ? entry.localizations.data : Array.isArray(entry.localizations) ? entry.localizations : [];
  const english = localizations.find((item) => item?.locale === 'en');
  const status = entry.publishedAt ? 'published' : 'draft';
  return {
    documentId: String(entry.documentId || ''),
    locale: entry.locale === 'en' ? 'en' : 'fr',
    title: typeof entry.title === 'string' ? entry.title : 'Sans titre',
    slug: typeof entry.slug === 'string' ? entry.slug : '',
    type: TYPES[entry.editorialType] ? entry.editorialType : 'article',
    status,
    translationStatus: english?.publishedAt ? 'complete' : 'missing',
    updatedAt: entry.updatedAt || entry.publishedAt || null,
  };
}
