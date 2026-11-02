import fs from 'node:fs';
import { escapeHtml, fetchPublications, renderPublicationBody } from './publications.mjs';

const labels = {
  fr: { title: 'Perspectives', kicker: 'Perspectives & partage de connaissances', empty: 'Les prochaines publications seront présentées ici.', unavailable: 'Le pôle éditorial est momentanément indisponible.', read: 'Lire la publication', back: 'Toutes les perspectives', updated: 'Mis à jour le', published: 'Publié le', by: 'Par', download: 'Télécharger le document' },
  en: { title: 'Insights', kicker: 'Perspectives & knowledge sharing', empty: 'New publications will appear here.', unavailable: 'The editorial area is temporarily unavailable.', read: 'Read publication', back: 'All insights', updated: 'Updated', published: 'Published', by: 'By', download: 'Download document' },
};
const typeLabels = {
  fr: { article: 'Article', study: 'Étude / rapport', note: 'Note / point de vue', 'case-study': 'Étude de cas', guide: 'Guide / ressource', intervention: 'Intervention / interview' },
  en: { article: 'Article', study: 'Study / report', note: 'Note / point of view', 'case-study': 'Case study', guide: 'Guide / resource', intervention: 'Talk / interview' },
};

function cssHref(buildDir) {
  const css = buildDir && fs.readdirSync(buildDir, { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => entry.name).find((name) => /^index-.*\.css$/.test(name));
  return css ? `/assets/${css}` : '/assets/index.css';
}

export function renderEditorialPage({ lang = 'fr', pageTitle, description, canonical, buildDir, body, jsonLd }) {
  const safeLang = lang === 'en' ? 'en' : 'fr';
  const css = cssHref(buildDir);
  return `<!doctype html><html lang="${safeLang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escapeHtml(description)}"><meta name="theme-color" content="#fbfaf6"><link rel="canonical" href="${escapeHtml(canonical)}"><link rel="stylesheet" href="${css}"><title>${escapeHtml(pageTitle)}</title><script type="application/ld+json">${JSON.stringify(jsonLd || {})}</script></head><body><a class="skip-link" href="#main">${safeLang === 'fr' ? 'Aller au contenu' : 'Skip to content'}</a>${body}</body></html>`;
}

function header(lang, current, canonicalBase) {
  const l = labels[lang];
  const route = (page, locale = lang) => `/${locale}/${page ? `${page}/` : ''}`;
  return `<header class="site-head"><a class="brand-mark" href="${route('', lang)}" aria-label="Brice Miaffo — ${lang === 'fr' ? 'accueil' : 'home'}"><span class="brand-symbol">B<span class="brand-point">·</span>M</span><span class="brand-copy"><b>BRICE MIAFFO</b><small>FINANCE &amp; LEADERSHIP</small></span></a><nav class="nav-links" aria-label="${lang === 'fr' ? 'Navigation principale' : 'Main navigation'}"><a href="${route('', lang)}">${lang === 'fr' ? 'Accueil' : 'Home'}</a><a href="${route('parcours', lang)}">${lang === 'fr' ? 'Parcours' : 'Career'}</a><a href="${route('expertises', lang)}">${lang === 'fr' ? 'Expertises' : 'Expertise'}</a><a href="${route('formations', lang)}">${lang === 'fr' ? 'Formations' : 'Training'}</a><a aria-current="page" href="${route('perspectives', lang)}">${l.title}</a></nav><div class="head-actions"><div class="language-switch" role="group" aria-label="Language / Langue"><a class="language-option ${lang === 'fr' ? 'active' : ''}" href="${canonicalBase}/fr/perspectives/">FR</a><a class="language-option ${lang === 'en' ? 'active' : ''}" href="${canonicalBase}/en/perspectives/">EN</a></div><a class="btn btn-primary contact-nav" href="${route('contact', lang)}">${lang === 'fr' ? 'Prendre contact' : 'Get in touch'} <span class="button-circle">↗</span></a></div></header>`;
}

function footer(lang) {
  return `<footer class="site-footer"><div class="footer-bottom"><a class="footer-wordmark" href="/${lang}/">BRICE<span>·</span>MIAFFO</a><div class="footer-bottom-links"><a href="/${lang}/parcours/">${lang === 'fr' ? 'Parcours' : 'Career'}</a><a href="/${lang}/expertises/">${lang === 'fr' ? 'Expertises' : 'Expertise'}</a><a href="/${lang}/formations/">${lang === 'fr' ? 'Formations' : 'Training'}</a><a href="https://mymadvisor.ca" rel="noopener noreferrer">M-Y-M Advisor ↗</a></div><small>© ${new Date().getFullYear()} Brice Merlin MIAFFO</small></div></footer>`;
}

function card(item, lang) {
  const l = labels[lang];
  return `<article class="press-feature publication-card"><div><span class="pill-outline">${escapeHtml(typeLabels[lang][item.editorialType])}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.excerpt)}</p><small>${l.published} ${new Date(item.publishedAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-CA')} · ${item.readingTime ? `${item.readingTime} min` : ''}</small><a class="text-link" href="/${lang}/perspectives/${encodeURIComponent(item.slug)}/">${l.read} <span>↗</span></a></div><span class="press-arrow">↗</span></article>`;
}

export function renderEditorialList({ lang, items, available, buildDir, publicUrl, search = '', category = '' }) {
  const l = labels[lang];
  const description = lang === 'fr' ? 'Articles, études, notes et ressources professionnelles de Brice Merlin Miaffo.' : 'Articles, studies, notes and professional resources by Brice Merlin Miaffo.';
  const base = `${publicUrl.replace(/\/$/, '')}`;
  const content = `${header(lang, 'perspectives', base)}<main id="main"><section class="inner-hero inner-hero-plain"><span class="micro-title">${l.kicker}</span><h1>${lang === 'fr' ? 'Des idées.<br><em>Un regard.</em>' : 'Ideas.<br><em>A perspective.</em>'}</h1><p>${description}</p></section><section class="section-pad perspectives-section"><div class="section-index">01 / ${lang === 'fr' ? 'PUBLICATIONS' : 'PUBLICATIONS'}</div><form class="catalogue-toolbar" method="get"><label class="filter-search"><span class="sr-only">${lang === 'fr' ? 'Rechercher' : 'Search'}</span><input class="input" name="q" value="${escapeHtml(search)}" placeholder="${lang === 'fr' ? 'Rechercher une publication…' : 'Search a publication…'}"></label><label><span class="sr-only">${lang === 'fr' ? 'Catégorie' : 'Category'}</span><input class="input" name="category" value="${escapeHtml(category)}" placeholder="${lang === 'fr' ? 'Catégorie' : 'Category'}"></label><button class="btn btn-primary" type="submit">${lang === 'fr' ? 'Filtrer' : 'Filter'}</button></form>${items.length ? items.map((item) => card(item, lang)).join('') : `<div class="training-zero" role="status">${available ? l.empty : l.unavailable}</div>`}</section></main>${footer(lang)}`;
  return renderEditorialPage({ lang, pageTitle: `${l.title} | Brice Merlin MIAFFO`, description, canonical: `${base}/${lang}/perspectives/`, buildDir, body: content, jsonLd: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: l.title, url: `${base}/${lang}/perspectives/` } });
}

export async function renderEditorialDetail({ lang, item, buildDir, publicUrl }) {
  const l = labels[lang];
  const base = publicUrl.replace(/\/$/, '');
  const canonical = `${base}/${lang}/perspectives/${encodeURIComponent(item.slug)}/`;
  const description = item.seo?.metaDescription || item.excerpt;
  let translation = item.translations.find((entry) => entry.locale !== lang);
  if (!translation && item.documentId) {
    const otherLocale = lang === 'fr' ? 'en' : 'fr';
    const sibling = await fetchPublications({ locale: otherLocale, documentId: item.documentId, pageSize: 1 });
    const translatedItem = sibling.items[0];
    if (translatedItem) translation = { locale: translatedItem.locale, slug: translatedItem.slug };
  }
  const alternate = translation ? `<p class="publication-translation"><a href="/${translation.locale}/perspectives/${encodeURIComponent(translation.slug)}/">${translation.locale === 'fr' ? 'Lire en français' : 'Read in English'} ↗</a></p>` : '';
  const metadata = `${l.published} ${new Date(item.publishedAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-CA')} · ${l.by} ${escapeHtml(item.authorName)}${item.readingTime ? ` · ${item.readingTime} min` : ''}`;
  const extra = [item.methodology && `<aside class="publication-callout"><strong>${lang === 'fr' ? 'Méthodologie' : 'Methodology'}</strong><p>${escapeHtml(item.methodology)}</p></aside>`, item.scope && `<aside class="publication-callout"><strong>${lang === 'fr' ? 'Périmètre' : 'Scope'}</strong><p>${escapeHtml(item.scope)}</p></aside>`, item.limitations && `<aside class="publication-callout"><strong>${lang === 'fr' ? 'Limites' : 'Limitations'}</strong><p>${escapeHtml(item.limitations)}</p></aside>`].filter(Boolean).join('');
  const body = `${header(lang, 'perspectives', base)}<main id="main"><article class="publication-page section-pad"><a class="text-link" href="/${lang}/perspectives/">← ${l.back}</a><p class="micro-title">${escapeHtml(typeLabels[lang][item.editorialType])}${item.eyebrow ? ` · ${escapeHtml(item.eyebrow)}` : ''}</p><h1>${escapeHtml(item.title)}</h1><p class="publication-excerpt">${escapeHtml(item.excerpt)}</p><p class="publication-meta">${metadata}</p>${alternate}<div class="publication-body">${renderPublicationBody(item.content)}${extra}</div>${item.references.length ? `<section class="publication-references"><h2>${lang === 'fr' ? 'Références' : 'References'}</h2><ul>${item.references.map((ref) => `<li>${escapeHtml(typeof ref === 'string' ? ref : ref.label || ref.url || '')}</li>`).join('')}</ul></section>` : ''}</article></main>${footer(lang)}`;
  return renderEditorialPage({ lang, pageTitle: `${item.seo?.metaTitle || item.title} | Brice Merlin MIAFFO`, description, canonical, buildDir, body, jsonLd: { '@context': 'https://schema.org', '@type': item.editorialType === 'study' ? 'Report' : 'Article', headline: item.title, description, datePublished: item.publishedAt, dateModified: item.updatedAt, inLanguage: lang, author: { '@type': 'Person', name: item.authorName }, mainEntityOfPage: canonical } });
}

export function renderRss({ lang, items, publicUrl }) {
  const base = publicUrl.replace(/\/$/, '');
  const title = lang === 'fr' ? 'Perspectives — Brice Merlin MIAFFO' : 'Insights — Brice Merlin MIAFFO';
  const entries = items.map((item) => `<item><title>${escapeHtml(item.title)}</title><link>${base}/${lang}/perspectives/${encodeURIComponent(item.slug)}/</link><guid isPermaLink="true">${base}/${lang}/perspectives/${encodeURIComponent(item.slug)}/</guid><description>${escapeHtml(item.excerpt)}</description><pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeHtml(title)}</title><link>${base}/${lang}/perspectives/</link><description>${escapeHtml(title)}</description>${entries}</channel></rss>`;
}
