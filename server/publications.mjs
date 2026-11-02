const PUBLICATION_TYPES = new Set(['article', 'study', 'note', 'case-study', 'guide', 'intervention']);
const LOCALES = new Set(['fr', 'en']);
const BLOCK_TYPES = new Set(['publication.heading', 'publication.rich-text', 'publication.image', 'publication.quote', 'publication.callout', 'publication.table', 'publication.download']);

export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

const RICH_TEXT_TAGS = new Set(['p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'blockquote', 'a']);
const safeHref = (value) => /^(https?:\/\/|mailto:|\/|#)/i.test(value) ? value : '';
export function sanitizeRichText(value = '') {
  return String(value).slice(0, 24000).replace(/<!--[\s\S]*?-->/g, '').replace(/<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/gi, (match, closing, tagName, rawAttributes) => {
    const tag = tagName.toLowerCase();
    if (!RICH_TEXT_TAGS.has(tag)) return '';
    if (closing) return `</${tag}>`;
    if (tag === 'br') return '<br/>';
    if (tag !== 'a') return `<${tag}>`;
    const hrefMatch = rawAttributes.match(/\bhref\s*=\s*["']([^"']*)["']/i);
    const href = safeHref(hrefMatch?.[1] || '');
    return href ? `<a href="${escapeHtml(href)}" rel="noopener noreferrer">` : '<a>';
  });
}

const asText = (value, max = 10000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const attrs = (entry) => entry?.attributes && typeof entry.attributes === 'object' ? { ...entry.attributes, documentId: entry.documentId, locale: entry.locale, publishedAt: entry.publishedAt } : entry || {};
const mediaPublicUrl = (media) => {
  const value = attrs(media);
  if (!value?.id) return asText(value?.url, 1000);
  const base = (process.env.CMS_PUBLIC_URL || process.env.CMS_URL || 'http://127.0.0.1:1337').replace(/\/$/, '');
  return `${base}/editorial-portal/public-media/${encodeURIComponent(value.id)}`;
};
const normalizeMedia = (media) => {
  const value = attrs(media);
  return value && typeof value === 'object' ? { ...value, url: mediaPublicUrl(value) } : null;
};

export function normalizePublication(entry) {
  const value = attrs(entry);
  const locale = LOCALES.has(value.locale) ? value.locale : null;
  const editorialType = PUBLICATION_TYPES.has(value.editorialType) ? value.editorialType : null;
  const slug = asText(value.slug, 160);
  if (!locale || !editorialType || !slug || !asText(value.title, 240) || !value.publishedAt) return null;
  const content = Array.isArray(value.content) ? value.content.filter((block) => BLOCK_TYPES.has(block?.__component)) : [];
  const localizationItems = Array.isArray(value.localizations?.data) ? value.localizations.data : Array.isArray(value.localizations) ? value.localizations : [];
  return {
    documentId: asText(value.documentId, 120),
    locale,
    status: 'published',
    publishedAt: value.publishedAt,
    updatedAt: value.updatedAt || value.updatedAtAt || value.publishedAt,
    editorialType,
    title: asText(value.title, 240),
    slug,
    eyebrow: asText(value.eyebrow, 120),
    excerpt: asText(value.excerpt, 600),
    content: content.map((block) => {
      if (block?.__component === 'publication.image' && block.image) return { ...block, image: normalizeMedia(block.image?.data || block.image) };
      if (block?.__component === 'publication.download' && block.file) return { ...block, file: normalizeMedia(block.file?.data || block.file) };
      return block;
    }),
    cover: normalizeMedia(value.cover?.data || value.cover),
    coverAlt: asText(value.coverAlt, 240),
    authorName: asText(value.authorName, 160) || 'Brice Merlin MIAFFO',
    category: asText(value.category, 120),
    tags: Array.isArray(value.tags) ? value.tags.filter((tag) => typeof tag === 'string').slice(0, 20) : [],
    readingTime: Number.isInteger(value.readingTime) ? value.readingTime : null,
    featured: value.featured === true,
    references: Array.isArray(value.references) ? value.references : [],
    methodology: asText(value.methodology, 3000),
    scope: asText(value.scope, 3000),
    dataDate: asText(value.dataDate, 40),
    limitations: asText(value.limitations, 3000),
    publicationAuthorization: asText(value.publicationAuthorization, 40),
    translations: localizationItems.map((item) => {
      const localized = attrs(item);
      return { locale: localized.locale, slug: asText(localized.slug, 160), publishedAt: localized.publishedAt || null };
    }).filter((item) => LOCALES.has(item.locale) && item.slug && item.publishedAt),
    seo: value.seo && typeof value.seo === 'object' ? {
      metaTitle: asText(value.seo.metaTitle, 240),
      metaDescription: asText(value.seo.metaDescription, 320),
      noIndex: value.seo.noIndex === true,
      shareImage: normalizeMedia(value.seo.shareImage?.data || value.seo.shareImage),
    } : null,
  };
}

function blockHtml(block) {
  const type = block.__component;
  if (type === 'publication.heading') {
    const level = block.level === 'h3' ? 'h3' : 'h2';
    return `<${level}>${escapeHtml(asText(block.text, 500))}</${level}>`;
  }
  if (type === 'publication.rich-text') {
    return block.html ? sanitizeRichText(block.html) : `<p>${escapeHtml(asText(block.text, 12000)).replace(/\r?\n/g, '<br/>')}</p>`;
  }
  if (type === 'publication.quote') {
    const source = block.source ? `<cite>${escapeHtml(asText(block.source, 240))}</cite>` : '';
    const by = block.attribution ? `<footer>— ${escapeHtml(asText(block.attribution, 180))}</footer>` : '';
    return `<blockquote>${escapeHtml(asText(block.text, 3000))}${by}${source}</blockquote>`;
  }
  if (type === 'publication.callout') {
    return `<aside class="publication-callout"><strong>${escapeHtml(asText(block.title, 240))}</strong><p>${escapeHtml(asText(block.text, 3000))}</p></aside>`;
  }
  if (type === 'publication.image') {
    const image = block.image?.data ? attrs(block.image.data) : block.image;
    const url = asText(image?.url, 1000);
    if (!url) return '';
    return `<figure><img loading="lazy" src="${escapeHtml(url)}" alt="${escapeHtml(asText(block.alt, 240))}">${block.caption ? `<figcaption>${escapeHtml(asText(block.caption, 500))}</figcaption>` : ''}</figure>`;
  }
  if (type === 'publication.table') {
    const headers = Array.isArray(block.headers) ? block.headers : [];
    const rows = Array.isArray(block.rows) ? block.rows : [];
    return `<div class="publication-table-wrap"><table>${headers.length ? `<thead><tr>${headers.map((cell) => `<th scope="col">${escapeHtml(cell)}</th>`).join('')}</tr></thead>` : ''}<tbody>${rows.map((row) => `<tr>${(Array.isArray(row) ? row : []).map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  if (type === 'publication.download') {
    const file = block.file?.data ? attrs(block.file.data) : block.file;
    const url = asText(file?.url, 1000);
    return url ? `<p class="publication-download"><a href="${escapeHtml(url)}" rel="noopener noreferrer">${escapeHtml(asText(block.label, 240))} ↗</a>${block.description ? `<small>${escapeHtml(asText(block.description, 500))}</small>` : ''}</p>` : '';
  }
  return '';
}

export function renderPublicationBody(blocks = []) {
  return blocks.map(blockHtml).join('');
}

export function publicationQuery({ locale, slug, documentId, search, category, page = 1, pageSize = 9 } = {}) {
  const params = new URLSearchParams({ status: 'published', locale: LOCALES.has(locale) ? locale : 'fr', 'populate': '*', 'sort[0]': 'publishedAt:desc', 'pagination[page]': String(Math.max(1, page)), 'pagination[pageSize]': String(Math.min(24, Math.max(1, pageSize))) });
  if (slug) params.set('filters[slug][$eq]', slug);
  if (documentId) params.set('filters[documentId][$eq]', documentId);
  if (category) params.set('filters[category][$eq]', category.slice(0, 120));
  if (search) params.set('filters[$or][0][title][$containsi]', search.slice(0, 120));
  return params.toString();
}

export async function fetchPublications({ locale = 'fr', slug, documentId, search, category, page = 1, pageSize = 9, fetchImpl = fetch } = {}) {
  const base = process.env.CMS_URL || 'http://127.0.0.1:1337';
  const timeout = Number(process.env.CMS_TIMEOUT_MS || 2500);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetchImpl(`${base.replace(/\/$/, '')}/api/publications?${publicationQuery({ locale, slug, documentId, search, category, page, pageSize })}`, {
      headers: process.env.CMS_API_TOKEN ? { Authorization: `Bearer ${process.env.CMS_API_TOKEN}` } : {},
      signal: controller.signal,
    });
    if (!response.ok) return { items: [], pagination: null, available: false };
    const payload = await response.json();
    const raw = Array.isArray(payload.data) ? payload.data : [];
    const items = raw.map(normalizePublication).filter(Boolean);
    return { items, pagination: payload.meta?.pagination || null, available: true };
  } catch {
    return { items: [], pagination: null, available: false };
  } finally {
    clearTimeout(timer);
  }
}
