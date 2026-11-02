import assert from 'node:assert/strict';

const baseUrl = process.env.EDITORIAL_BASE_URL || 'http://127.0.0.1:1337';
const publicBaseUrl = process.env.EDITORIAL_PUBLIC_BASE_URL;
const email = process.env.EDITORIAL_QA_EMAIL;
const password = process.env.EDITORIAL_QA_PASSWORD;
if (!email || !password) {
  console.error('EDITORIAL_QA_EMAIL et EDITORIAL_QA_PASSWORD sont requis pour ce scénario local.');
  process.exitCode = 2;
}

let cookie = '';
let mediaIds = [];
const status = async (path, headers = {}) => (await fetch(`${baseUrl}${path}`, { headers })).status;
const publicResponse = async (path) => fetch(`${publicBaseUrl}${path}`);
const request = async (path, options = {}) => {
  const headers = { Accept: 'application/json', ...(options.body instanceof FormData ? {} : options.body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...(options.headers || {}) };
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const setCookies = response.headers.getSetCookie?.() || [];
  if (setCookies.length) cookie = setCookies.map((value) => value.split(';', 1)[0]).join('; ');
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${response.status} ${body?.error?.message || body?.message || path}`);
  return body;
};

if (email && password) {
  const slug = `qa-local-${Date.now()}`;
  let documentId;
  try {
    await request('/editorial-portal/session', { method: 'POST', body: JSON.stringify({ email, password }) });
    const imageBytes = await import('node:fs/promises').then(({ readFile }) => readFile('public/assets/brice-miaffo-portrait.webp'));
    const imageForm = new FormData();
    imageForm.append('files', new Blob([imageBytes], { type: 'image/webp' }), 'qa-local.webp');
    const uploadedImage = await request('/editorial-portal/media', { method: 'POST', body: imageForm });
    assert.equal(uploadedImage.data.length, 1);
    mediaIds.push(uploadedImage.data[0].id);
    const imageId = uploadedImage.data[0].id;
    const rawImagePath = `/uploads/${encodeURIComponent(uploadedImage.data[0].name)}`;
    const pdfBytes = new TextEncoder().encode('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n');
    const pdfForm = new FormData();
    pdfForm.append('files', new Blob([pdfBytes], { type: 'application/pdf' }), 'qa-local.pdf');
    const uploadedPdf = await request('/editorial-portal/media', { method: 'POST', body: pdfForm });
    assert.equal(uploadedPdf.data.length, 1);
    mediaIds.push(uploadedPdf.data[0].id);
    const invalidForm = new FormData();
    invalidForm.append('files', new Blob(['not allowed'], { type: 'application/json' }), 'package.json');
    await assert.rejects(request('/editorial-portal/media', { method: 'POST', body: invalidForm }), /Formats acceptés/);
    await assert.rejects(request('/editorial-portal/publications', { method: 'POST', body: JSON.stringify({ locale: 'fr', data: { title: 'QA image incomplete', slug: `${slug}-invalid`, editorialType: 'article', category: 'QA', excerpt: 'Résumé', content: [{ __component: 'publication.image', caption: 'Sans média' }] } }) }), /400/);
    const invalidSearch = await request(`/editorial-portal/publications?search=${encodeURIComponent(`${slug}-invalid`)}&pageSize=50`);
    assert.equal((invalidSearch.data || []).some((item) => item.slug === `${slug}-invalid`), false, 'Une publication invalide ne doit pas être persistée');
    const created = await request('/editorial-portal/publications', { method: 'POST', body: JSON.stringify({ locale: 'fr', data: { title: 'QA publication locale', slug, editorialType: 'study', category: 'QA', excerpt: 'Résumé temporaire', coverId: imageId, coverAlt: 'Image QA', content: [{ __component: 'publication.rich-text', text: 'Texte temporaire important', html: '<p>Texte temporaire <strong>important</strong></p>' }, { __component: 'publication.image', image: imageId, alt: 'Image QA', caption: 'Média QA' }] } }) });
    documentId = created.data.documentId;
    assert.equal(created.data.status, 'draft');
    assert.equal(await status(rawImagePath), 404);
    assert.equal(await status(`/editorial-portal/public-media/${imageId}`), 404);
    assert.equal(await status(`/editorial-portal/media/${imageId}/file`, { Cookie: cookie }), 200);
    const reopened = await request(`/editorial-portal/publications/${documentId}?locale=fr`);
    assert.equal(reopened.data.title, 'QA publication locale');
    assert.equal(reopened.data.content.length, 2);
    assert.match(reopened.data.content[0].html, /<strong>important<\/strong>/);
    const translated = await request(`/editorial-portal/publications/${documentId}/translate`, { method: 'POST', body: JSON.stringify({ data: { title: 'QA local publication', slug: `${slug}-en`, editorialType: 'study', category: 'QA', excerpt: 'Temporary summary', content: [{ __component: 'publication.rich-text', text: 'Temporary content' }] } }) });
    assert.equal(translated.data.locale, 'en');
    assert.equal(translated.data.documentId, documentId);
    const preview = await request(`/editorial-portal/preview/${documentId}?locale=fr`);
    assert.equal(preview.preview, true);
    await request(`/editorial-portal/publications/${documentId}/publish`, { method: 'POST', body: JSON.stringify({ locale: 'fr' }) });
    assert.equal(await status(`/editorial-portal/public-media/${imageId}`), 200);
    assert.equal(await status(rawImagePath), 404);
    await request(`/editorial-portal/publications/${documentId}/publish`, { method: 'POST', body: JSON.stringify({ locale: 'en' }) });
    if (publicBaseUrl) {
      const [frPage, enPage, listPage, sitemap, rss] = await Promise.all([
        publicResponse(`/fr/perspectives/${slug}/`),
        publicResponse(`/en/perspectives/${slug}-en/`),
        publicResponse('/fr/perspectives/'),
        publicResponse('/sitemap.xml'),
        publicResponse('/en/perspectives/feed.xml'),
      ]);
      assert.equal(frPage.status, 200);
      assert.equal(enPage.status, 200);
      assert.equal(listPage.status, 200);
      assert.equal(sitemap.status, 200);
      assert.equal(rss.status, 200);
      const frHtml = await frPage.text();
      const enHtml = await enPage.text();
      const listHtml = await listPage.text();
      const sitemapXml = await sitemap.text();
      const rssXml = await rss.text();
      assert.match(frHtml, /hreflang="en"/);
      assert.match(frHtml, /QA publication locale/);
      assert.match(frHtml, /<strong>important<\/strong>/);
      assert.match(enHtml, /QA local publication/);
      assert.match(listHtml, /QA publication locale/);
      assert.match(sitemapXml, new RegExp(`/fr/perspectives/${slug}/`));
      assert.match(rssXml, new RegExp(`${slug}-en`));
    }
    const unpublished = await request(`/editorial-portal/publications/${documentId}/unpublish`, { method: 'POST', body: JSON.stringify({ locale: 'fr' }) });
    assert.equal(unpublished.data.status, 'draft');
    assert.equal(await status(`/editorial-portal/public-media/${imageId}`), 404);
    if (publicBaseUrl) assert.equal((await publicResponse(`/fr/perspectives/${slug}/`)).status, 404);
    const unpublishedEnglish = await request(`/editorial-portal/publications/${documentId}/unpublish`, { method: 'POST', body: JSON.stringify({ locale: 'en' }) });
    assert.equal(unpublishedEnglish.data.status, 'draft');
    if (publicBaseUrl) assert.equal((await publicResponse(`/en/perspectives/${slug}-en/`)).status, 404);
    console.log(`PASS editorial local workflow (${documentId})`);
  } finally {
    if (documentId) {
      await request(`/editorial-portal/publications/${documentId}`, { method: 'DELETE' }).catch(() => {});
      const remaining = await request(`/editorial-portal/publications?search=${encodeURIComponent(slug)}&pageSize=50`).catch(() => ({ data: [] }));
      assert.equal((remaining.data || []).some((item) => item.documentId === documentId), false);
    }
    await Promise.all(mediaIds.map((id) => request(`/editorial-portal/media/${id}`, { method: 'DELETE' }).catch(() => {})));
  }
}
