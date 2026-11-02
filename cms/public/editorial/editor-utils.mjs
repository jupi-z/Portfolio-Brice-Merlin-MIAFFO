const MAX_META_TITLE = 60;
const MAX_META_DESCRIPTION = 160;
const WORDS_PER_MINUTE = 200;

const asText = (value) => typeof value === 'string' ? value.trim() : '';
const shorten = (value, limit) => {
  const text = asText(value).replace(/\s+/g, ' ');
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(1, limit - 1)).trimEnd()}…`;
};

export function slugifyTitle(value) {
  return asText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function blockText(block) {
  if (!block || typeof block !== 'object') return '';
  return [block.text, block.title, block.caption, block.attribution, block.source, block.label, block.description, block.headers, block.rows]
    .flatMap((value) => Array.isArray(value) ? value.flat(Infinity) : [value])
    .filter((value) => typeof value === 'string')
    .join(' ');
}

export function estimateReadingTime(blocks = []) {
  const words = blocks.map(blockText).join(' ').trim().match(/\S+/g)?.length || 0;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function suggestSeo({ title = '', excerpt = '', blocks = [] } = {}) {
  const body = asText(excerpt) || blocks.map(blockText).join(' ');
  return {
    metaTitle: shorten(title, MAX_META_TITLE),
    metaDescription: shorten(body, MAX_META_DESCRIPTION),
  };
}

export function normalizeEditorBlock(block = {}) {
  const normalized = { ...block };
  if (normalized.__component === 'publication.table') {
    normalized.headers = Array.isArray(normalized.headers) ? normalized.headers.join(' | ') : asText(normalized.headers);
    normalized.rows = Array.isArray(normalized.rows)
      ? normalized.rows.map((row) => Array.isArray(row) ? row.join(' | ') : asText(row)).join('\n')
      : asText(normalized.rows);
  }
  if (normalized.__component === 'publication.image' && normalized.mediaId === undefined) normalized.mediaId = normalized.image?.id || normalized.image || '';
  if (normalized.__component === 'publication.download' && normalized.mediaId === undefined) normalized.mediaId = normalized.file?.id || normalized.file || '';
  return normalized;
}

function mediaId(value) {
  const result = Number(value);
  return Number.isInteger(result) && result > 0 ? result : null;
}

export function serializeEditorBlocks(blocks = []) {
  return blocks.map((block) => {
    if (block.__component === 'publication.table') {
      return {
        __component: 'publication.table',
        caption: asText(block.caption),
        headers: asText(block.headers).split('|').map((cell) => cell.trim()).filter(Boolean),
        rows: asText(block.rows).split('\n').map((row) => row.split('|').map((cell) => cell.trim())).filter((row) => row.some(Boolean)),
      };
    }
    if (block.__component === 'publication.image') return { __component: 'publication.image', image: mediaId(block.mediaId), alt: asText(block.alt), caption: asText(block.caption) };
    if (block.__component === 'publication.download') return { __component: 'publication.download', file: mediaId(block.mediaId), label: asText(block.label), description: asText(block.description) };
    if (block.__component === 'publication.heading') return { __component: 'publication.heading', level: block.level === 'h3' ? 'h3' : 'h2', text: asText(block.text) };
    if (block.__component === 'publication.quote') return { __component: 'publication.quote', text: asText(block.text), attribution: asText(block.attribution), source: asText(block.source) };
    if (block.__component === 'publication.callout') return { __component: 'publication.callout', title: asText(block.title), text: asText(block.text) };
    return { __component: 'publication.rich-text', text: asText(block.text) };
  });
}
