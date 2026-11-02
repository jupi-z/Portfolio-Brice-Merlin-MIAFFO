import { createAutosaveController, estimateReadingTime, normalizeEditorBlock, serializeEditorBlocks, slugifyTitle, suggestSeo } from './editor-utils.mjs';

const $ = (selector, root = document) => root.querySelector(selector);
const api = async (path, options = {}) => {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = { Accept: 'application/json', ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  const response = await fetch(path, { ...options, headers, credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !options.__retried && !path.includes('/session')) {
      const refresh = await fetch('/editorial-portal/session/refresh', { method: 'POST', credentials: 'include', headers: { Accept: 'application/json' } });
      if (refresh.ok) return api(path, { ...options, __retried: true });
    }
    if (response.status === 401) showLogin();
    throw new Error(data?.error?.message || data?.message || 'Une erreur est survenue.');
  }
  return data;
};

const labels = { article: 'Article', study: 'Étude / rapport', note: 'Note / point de vue', 'case-study': 'Étude de cas', guide: 'Guide / ressource', intervention: 'Intervention / interview' };
const blockLabels = { 'publication.rich-text': 'Texte', 'publication.heading': 'Titre', 'publication.quote': 'Citation', 'publication.callout': 'Encadré', 'publication.table': 'Tableau', 'publication.image': 'Image', 'publication.download': 'PDF' };
const state = { items: [], page: 1, pagination: null, blocks: [], media: [], activeEditor: null, dirty: false, saving: null, dragIndex: null, slugManual: false, seoOverrides: { title: false, description: false } };
const form = () => $('#publication-form');
const value = (name) => form().elements[name]?.value || '';
const setValue = (name, content) => { if (form().elements[name]) form().elements[name].value = content ?? ''; };
const setMessage = (message, type = '') => { const node = $('#form-message'); node.textContent = message; node.className = type; };
const setAutosaveStatus = (message, type = '') => { const node = $('#autosave-status'); node.textContent = message; node.className = `save-status ${type}`; };

function showLogin() { $('#login-view').hidden = false; $('#portal-view').hidden = true; }
function showView(name) {
  document.querySelectorAll('.view').forEach((view) => { view.hidden = view.id !== `${name}-view`; });
  document.querySelectorAll('[data-view]').forEach((item) => item.classList.toggle('active', item.dataset.view === name));
  if (name === 'publications') loadPublications();
  if (name === 'media') loadMedia();
}

function markDirty() {
  state.dirty = true;
  setAutosaveStatus('Modifications non enregistrées', 'warning');
  autosave.schedule();
}

function updateDerived() {
  const title = value('title');
  if (!state.slugManual) setValue('slug', slugifyTitle(title));
  setValue('readingTime', estimateReadingTime(state.blocks));
  const seo = suggestSeo({ title, excerpt: value('excerpt'), blocks: state.blocks });
  if (!state.seoOverrides.title) setValue('metaTitle', seo.metaTitle);
  if (!state.seoOverrides.description) setValue('metaDescription', seo.metaDescription);
  updateSeoPanel();
}

function updateSeoPanel() {
  const title = value('title');
  const excerpt = value('excerpt');
  const checks = [
    [title.length >= 20 && title.length <= 70, 'Le titre est suffisamment explicite.'],
    [excerpt.length >= 50, 'Le résumé aide les moteurs et les lecteurs.'],
    [Boolean(value('slug')), 'L’adresse de la publication est prête.'],
    [state.blocks.length > 0, 'Le contenu contient au moins un élément.'],
    [state.blocks.filter((block) => block.__component === 'publication.image').every((block) => Boolean(block.alt)), 'Les images ont un texte alternatif.'],
  ];
  const warnings = checks.filter(([ok]) => !ok);
  const score = $('#seo-score');
  if (score) { score.textContent = warnings.length ? `${checks.length - warnings.length}/${checks.length} contrôles SEO — à compléter` : 'SEO prêt — les réglages techniques seront générés automatiquement'; score.classList.toggle('warning', warnings.length > 0); }
  const checklist = $('#seo-checklist');
  if (checklist) { checklist.replaceChildren(); checks.forEach(([ok, label]) => { const item = document.createElement('li'); item.className = ok ? 'ok' : 'warn'; item.textContent = label; checklist.append(item); }); }
  const previewTitle = $('#seo-preview-title'); if (previewTitle) previewTitle.textContent = value('metaTitle') || title || 'Titre de la publication';
  const previewDescription = $('#seo-preview-description'); if (previewDescription) previewDescription.textContent = value('metaDescription') || excerpt || 'La description apparaîtra ici.';
  const previewUrl = $('#seo-preview-url'); if (previewUrl) previewUrl.textContent = `brice-miaffo.com/perspectives/${value('slug') || '...'}`;
}

function addBlock(type) {
  state.blocks.push({ __component: `publication.${type}`, ...(type === 'heading' ? { level: 'h2', text: '' } : type === 'quote' ? { text: '', attribution: '', source: '' } : type === 'callout' ? { title: '', text: '' } : type === 'table' ? { caption: '', headers: '', rows: '' } : type === 'image' ? { mediaId: '', alt: '', caption: '' } : type === 'download' ? { mediaId: '', label: '', description: '' } : { text: '' }) });
  renderBlocks();
  markDirty();
}

function field(labelText, key, tag = 'textarea', block) {
  const wrapper = document.createElement('label'); wrapper.textContent = labelText;
  const input = document.createElement(tag); input.value = block[key] || '';
  if (tag === 'textarea') input.rows = 4;
  input.addEventListener('input', () => { block[key] = input.value; markDirty(); updateDerived(); });
  wrapper.append(input); return wrapper;
}

function mediaField(labelText, kind, block) {
  const wrapper = document.createElement('label'); wrapper.textContent = labelText;
  const select = document.createElement('select'); select.append(new Option('Choisir un fichier', ''));
  state.media.filter((file) => kind === 'image' ? file.mime.startsWith('image/') : file.mime === 'application/pdf').forEach((file) => select.append(new Option(file.name, file.id, String(file.id) === String(block.mediaId), String(file.id) === String(block.mediaId))));
  select.addEventListener('change', () => { block.mediaId = select.value; markDirty(); updateDerived(); }); wrapper.append(select); return wrapper;
}

function moveBlock(index, offset) { const target = index + offset; if (target < 0 || target >= state.blocks.length) return; [state.blocks[index], state.blocks[target]] = [state.blocks[target], state.blocks[index]]; renderBlocks(); markDirty(); }
function renderBlocks() {
  const target = $('#blocks'); target.replaceChildren();
  state.blocks.forEach((block, index) => {
    const card = document.createElement('article'); card.className = 'block-card'; card.draggable = true; card.dataset.index = String(index);
    const header = document.createElement('div'); header.className = 'block-header'; const title = document.createElement('strong'); title.textContent = blockLabels[block.__component] || 'Bloc'; const tools = document.createElement('div'); tools.className = 'block-tools';
    [['↑', 'up'], ['↓', 'down'], ['Dupliquer', 'duplicate'], ['Supprimer', 'remove']].forEach(([text, action]) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'block-tool'; button.textContent = text; button.title = action; button.addEventListener('click', () => { if (action === 'up') moveBlock(index, -1); else if (action === 'down') moveBlock(index, 1); else if (action === 'duplicate') { state.blocks.splice(index + 1, 0, structuredClone(block)); renderBlocks(); markDirty(); } else { state.blocks.splice(index, 1); renderBlocks(); markDirty(); } }); tools.append(button); }); header.append(title, tools); card.append(header);
    if (block.__component === 'publication.rich-text') { const editor = document.createElement('div'); editor.className = 'rich-editor'; editor.contentEditable = 'true'; editor.setAttribute('role', 'textbox'); editor.setAttribute('aria-multiline', 'true'); editor.dataset.placeholder = 'Commencez à écrire…'; if (block.html) editor.innerHTML = block.html; else editor.textContent = block.text || ''; editor.addEventListener('focus', () => { state.activeEditor = editor; }); editor.addEventListener('input', () => { state.activeEditor = editor; block.html = editor.innerHTML; block.text = editor.innerText; markDirty(); updateDerived(); }); card.append(editor); }
    else if (block.__component === 'publication.heading') { const level = document.createElement('label'); level.textContent = 'Niveau'; const select = document.createElement('select'); ['h2', 'h3'].forEach((item) => select.append(new Option(item.toUpperCase(), item, item === block.level, item === block.level))); select.addEventListener('change', () => { block.level = select.value; markDirty(); }); level.append(select); card.append(level, field('Titre', 'text', 'input', block)); }
    else if (block.__component === 'publication.quote') card.append(field('Citation', 'text', 'textarea', block), field('Auteur', 'attribution', 'input', block), field('Source', 'source', 'input', block));
    else if (block.__component === 'publication.callout') card.append(field('Titre de l’encadré', 'title', 'input', block), field('Contenu', 'text', 'textarea', block));
    else if (block.__component === 'publication.table') card.append(field('Légende', 'caption', 'input', block), field('En-têtes séparés par |', 'headers', 'input', block), field('Lignes séparées par un retour à la ligne, cellules par |', 'rows', 'textarea', block));
    else if (block.__component === 'publication.image') card.append(mediaField('Image', 'image', block), field('Texte alternatif', 'alt', 'input', block), field('Légende', 'caption', 'input', block));
    else if (block.__component === 'publication.download') card.append(mediaField('Document PDF', 'file', block), field('Libellé', 'label', 'input', block), field('Description', 'description', 'textarea', block));
    target.append(card);
    card.addEventListener('dragstart', () => { state.dragIndex = index; card.classList.add('dragging'); }); card.addEventListener('dragend', () => card.classList.remove('dragging')); card.addEventListener('dragover', (event) => event.preventDefault()); card.addEventListener('drop', (event) => { event.preventDefault(); if (state.dragIndex === null || state.dragIndex === index) return; const [moved] = state.blocks.splice(state.dragIndex, 1); state.blocks.splice(index, 0, moved); state.dragIndex = null; renderBlocks(); markDirty(); });
  });
  updateDerived();
}

function blankPublication() { autosave.cancel(); state.blocks = [{ __component: 'publication.rich-text', text: '' }]; state.slugManual = false; state.seoOverrides = { title: false, description: false }; form().reset(); setValue('authorName', 'Brice Merlin MIAFFO'); setValue('category', 'Analyse'); setValue('locale', 'fr'); fillCoverOptions(); $('#editor-eyebrow').textContent = 'NOUVELLE PUBLICATION'; $('#editor-title').textContent = 'Créer une publication'; state.dirty = false; setAutosaveStatus('Nouveau brouillon'); renderBlocks(); setMessage(''); }
function fillEditor(item) { autosave.cancel(); const data = item.data || item; ['documentId', 'title', 'slug', 'eyebrow', 'editorialType', 'category', 'authorName', 'excerpt', 'methodology', 'scope', 'limitations', 'dataDate', 'publicationAuthorization'].forEach((key) => setValue(key, data[key])); setValue('locale', data.locale || 'fr'); setValue('tags', Array.isArray(data.tags) ? data.tags.join(', ') : ''); setValue('readingTime', data.readingTime || ''); setValue('references', Array.isArray(data.references) ? data.references.join('\n') : ''); setValue('metaTitle', data.seo?.metaTitle || ''); setValue('metaDescription', data.seo?.metaDescription || ''); setValue('coverAlt', data.coverAlt || ''); setValue('coverId', data.cover?.id || ''); form().elements.featured.checked = Boolean(data.featured); form().elements.noIndex.checked = Boolean(data.seo?.noIndex); state.slugManual = Boolean(data.slug); state.seoOverrides = { title: Boolean(data.seo?.metaTitle), description: Boolean(data.seo?.metaDescription) }; state.blocks = Array.isArray(data.content) && data.content.length ? data.content.map(normalizeEditorBlock) : [{ __component: 'publication.rich-text', text: '' }]; $('#editor-eyebrow').textContent = 'MODIFIER LA PUBLICATION'; $('#editor-title').textContent = data.title || 'Modifier une publication'; state.dirty = false; setAutosaveStatus('Brouillon enregistré', 'success'); renderBlocks(); setMessage(''); }
function fillCoverOptions(selected = '') { const select = $('#cover-media'); if (!select) return; select.replaceChildren(new Option('Aucune image', '')); state.media.filter((file) => file.mime.startsWith('image/')).forEach((file) => select.append(new Option(file.name, file.id, String(file.id) === String(selected), String(file.id) === String(selected)))); }
function collectData() { updateDerived(); return { title: value('title'), slug: value('slug') || slugifyTitle(value('title')), eyebrow: value('eyebrow'), editorialType: value('editorialType'), category: value('category'), authorName: value('authorName'), excerpt: value('excerpt'), tags: value('tags').split(',').map((tag) => tag.trim()).filter(Boolean), readingTime: value('readingTime'), featured: form().elements.featured.checked, coverId: value('coverId'), coverAlt: value('coverAlt'), content: serializeEditorBlocks(state.blocks), methodology: value('methodology'), scope: value('scope'), dataDate: value('dataDate'), limitations: value('limitations'), publicationAuthorization: value('publicationAuthorization'), references: value('references').split('\n').map((item) => item.trim()).filter(Boolean), seo: { metaTitle: value('metaTitle'), metaDescription: value('metaDescription'), noIndex: form().elements.noIndex.checked } }; }

function renderList(items, target) { const node = $(target); node.replaceChildren(); if (!items.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'Aucune publication pour ces critères.'; node.append(empty); return; } items.forEach((item) => { const row = document.createElement('article'); row.className = 'publication'; const info = document.createElement('div'); const heading = document.createElement('h3'); heading.textContent = item.title || 'Sans titre'; const meta = document.createElement('small'); meta.textContent = `${labels[item.editorialType] || 'Publication'} · ${item.locale === 'en' ? 'English' : 'Français'} · ${item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('fr-FR') : 'récente'}`; info.append(heading, meta); const actions = document.createElement('div'); actions.className = 'row-actions'; const badge = document.createElement('span'); badge.className = `badge${item.status === 'draft' ? ' draft' : ''}`; badge.textContent = item.status === 'published' ? 'Publié' : 'Brouillon'; const edit = document.createElement('button'); edit.className = 'button quiet small'; edit.textContent = 'Modifier'; edit.addEventListener('click', () => openEditor(item.documentId, item.locale)); const toggle = document.createElement('button'); toggle.className = 'button quiet small'; toggle.textContent = item.status === 'published' ? 'Dépublier' : 'Publier'; toggle.addEventListener('click', async () => { toggle.disabled = true; try { await api(`/editorial-portal/publications/${encodeURIComponent(item.documentId)}/${item.status === 'published' ? 'unpublish' : 'publish'}`, { method: 'POST', body: JSON.stringify({ locale: item.locale }) }); await loadPublications(); } catch (error) { window.alert(error.message); } finally { toggle.disabled = false; } }); const remove = document.createElement('button'); remove.className = 'button quiet small danger-button'; remove.textContent = 'Supprimer'; remove.addEventListener('click', async () => { if (!window.confirm('Supprimer cette publication et ses traductions ?')) return; try { await api(`/editorial-portal/publications/${encodeURIComponent(item.documentId)}`, { method: 'DELETE' }); await loadPublications(); } catch (error) { window.alert(error.message); } }); actions.append(badge, edit, toggle, remove); row.append(info, actions); node.append(row); }); }
async function loadPublications() { const params = new URLSearchParams({ page: String(state.page), pageSize: '12' }); const search = $('#search')?.value.trim(); const status = $('#status-filter')?.value; const type = $('#type-filter')?.value; if (search) params.set('search', search); if (status) params.set('status', status); if (type) params.set('type', type); const result = await api(`/editorial-portal/publications?${params}`); state.items = result.data || []; state.pagination = result.meta || null; const drafts = state.items.filter((item) => item.status === 'draft').length; $('#draft-count').textContent = drafts; $('#published-count').textContent = state.items.length - drafts; $('#translation-count').textContent = state.items.filter((item) => !(item.localizations || []).some((locale) => locale.locale === 'en' && locale.publishedAt)).length; renderList(state.items.slice(0, 5), '#recent-list'); renderList(state.items, '#all-list'); const pagination = $('#pagination'); pagination.replaceChildren(); if (state.pagination && state.pagination.pageCount > 1) { const label = document.createElement('span'); label.textContent = `Page ${state.pagination.page} / ${state.pagination.pageCount}`; const next = document.createElement('button'); next.className = 'button quiet small'; next.textContent = 'Suivant'; next.disabled = state.page >= state.pagination.pageCount; next.addEventListener('click', () => { state.page += 1; loadPublications(); }); pagination.append(label, next); } }
async function loadMedia() { const result = await api('/editorial-portal/media'); state.media = result.data || []; fillCoverOptions(value('coverId')); const target = $('#media-list'); if (!target) return; target.replaceChildren(); if (!state.media.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'Aucun média importé.'; target.append(empty); return; } state.media.forEach((file) => { const row = document.createElement('article'); row.className = 'publication'; const info = document.createElement('div'); const title = document.createElement('h3'); title.textContent = file.name; const meta = document.createElement('small'); meta.textContent = `${file.mime} · ${Math.round(file.size)} Ko`; info.append(title, meta); const actions = document.createElement('div'); actions.className = 'row-actions'; const open = document.createElement('a'); open.className = 'button quiet small'; open.href = file.url; open.target = '_blank'; open.rel = 'noreferrer'; open.textContent = 'Ouvrir'; const remove = document.createElement('button'); remove.className = 'button quiet small danger-button'; remove.textContent = 'Supprimer'; remove.addEventListener('click', async () => { if (!window.confirm('Supprimer ce fichier ?')) return; await api(`/editorial-portal/media/${file.id}`, { method: 'DELETE' }); await loadMedia(); }); actions.append(open, remove); row.append(info, actions); target.append(row); }); }
async function uploadMedia(event) { event.preventDefault(); const input = $('#media-files'); const files = Array.from(input.files || []); if (!files.length) return; const body = new FormData(); files.forEach((file) => body.append('files', file)); const message = $('#media-message'); message.textContent = 'Importation…'; try { await api('/editorial-portal/media', { method: 'POST', body }); input.value = ''; message.textContent = 'Fichier(s) importé(s).'; await loadMedia(); } catch (error) { message.textContent = error.message; message.className = 'error'; } }
async function saveDraft({ silent = false } = {}) { if (state.saving) return state.saving; if (!value('documentId') && silent) return; if (!silent) setMessage('Enregistrement…'); setAutosaveStatus('Enregistrement…'); const documentId = value('documentId'); const payload = { locale: value('locale'), data: collectData() }; state.saving = (async () => { try { const result = documentId ? await api(`/editorial-portal/publications/${encodeURIComponent(documentId)}`, { method: 'PUT', body: JSON.stringify(payload) }) : await api('/editorial-portal/publications', { method: 'POST', body: JSON.stringify(payload) }); fillEditor(result.data); setAutosaveStatus('Brouillon enregistré', 'success'); if (!silent) setMessage('Brouillon enregistré.', 'success'); return result; } catch (error) { state.dirty = true; setAutosaveStatus('Erreur — réessayez', 'error'); if (!silent) setMessage(error.message, 'error'); throw error; } finally { state.saving = null; } })(); return state.saving; }
async function savePublication(event) { event.preventDefault(); await saveDraft(); }
async function prepareTranslation() { const documentId = value('documentId'); if (!documentId) { setMessage('Enregistrez d’abord le brouillon français.', 'error'); return; } try { const result = await api(`/editorial-portal/publications/${encodeURIComponent(documentId)}/translate`, { method: 'POST', body: JSON.stringify({ data: collectData() }) }); fillEditor(result.data); setValue('locale', 'en'); setMessage('Brouillon anglais préparé avec les champs source. Traduisez puis enregistrez.', 'success'); } catch (error) { setMessage(error.message, 'error'); } }
function previewPublication() { const documentId = value('documentId'); const locale = value('locale'); if (!documentId) return setMessage('Enregistrez d’abord le brouillon.', 'error'); window.open(`/editorial/preview.html?documentId=${encodeURIComponent(documentId)}&locale=${encodeURIComponent(locale)}`, '_blank', 'noopener,noreferrer'); }
const autosave = createAutosaveController({ shouldSave: () => Boolean(value('documentId')), save: () => saveDraft({ silent: true }) });
function focusPanel(name) { document.querySelectorAll('[data-panel-view]').forEach((view) => { view.hidden = view.dataset.panelView !== name; }); document.querySelectorAll('[data-panel]').forEach((button) => button.classList.toggle('active', button.dataset.panel === name)); }
function executeCommand(command) { if (['bold', 'italic', 'insertUnorderedList'].includes(command)) { if (!state.activeEditor) return setMessage('Cliquez dans un texte avant de le mettre en forme.', 'error'); document.execCommand(command); state.activeEditor.dispatchEvent(new Event('input', { bubbles: true })); return; } if (command === 'link') { if (!state.activeEditor) return setMessage('Cliquez dans un texte avant d’ajouter un lien.', 'error'); const url = window.prompt('Adresse du lien'); if (url) { document.execCommand('createLink', false, url); state.activeEditor.dispatchEvent(new Event('input', { bubbles: true })); } return; } if (command === 'paragraph') return addBlock('rich-text'); return addBlock(command); }

$('#login-form').addEventListener('submit', async (event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); $('#login-error').textContent = ''; try { const result = await api('/editorial-portal/session', { method: 'POST', body: JSON.stringify({ email: formData.get('email'), password: formData.get('password') }) }); $('#user-name').textContent = result.data?.user?.firstname ? `${result.data.user.firstname} ${result.data.user.lastname || ''}` : ''; $('#login-view').hidden = true; $('#portal-view').hidden = false; showView('dashboard'); await loadMedia(); await loadPublications(); } catch (error) { $('#login-error').textContent = error.message; } });
$('#logout').addEventListener('click', async () => { await api('/editorial-portal/session/logout', { method: 'POST' }).catch(() => {}); showLogin(); });
document.addEventListener('click', (event) => { const view = event.target.closest('[data-view]'); if (view) { if (view.dataset.view === 'new') blankPublication(); showView(view.dataset.view); } const command = event.target.closest('[data-command]'); if (command) executeCommand(command.dataset.command === 'bullet-list' ? 'insertUnorderedList' : command.dataset.command); const panel = event.target.closest('[data-panel]'); if (panel) focusPanel(panel.dataset.panel); const action = event.target.closest('[data-action]'); if (action?.dataset.action === 'translate') prepareTranslation(); if (action?.dataset.action === 'preview') previewPublication(); });
document.querySelectorAll('#editor-toolbar, .insert-bar').forEach((bar) => bar.addEventListener('mousedown', (event) => { if (event.target.closest('button')) event.preventDefault(); }));
form().addEventListener('submit', savePublication); $('#media-form').addEventListener('submit', uploadMedia); form().elements.title.addEventListener('input', () => { markDirty(); updateDerived(); }); form().elements.slug.addEventListener('input', () => { state.slugManual = true; markDirty(); updateDerived(); }); form().elements.metaTitle.addEventListener('input', () => { state.seoOverrides.title = true; markDirty(); updateSeoPanel(); }); form().elements.metaDescription.addEventListener('input', () => { state.seoOverrides.description = true; markDirty(); updateSeoPanel(); }); form().elements.excerpt.addEventListener('input', () => { markDirty(); updateDerived(); }); ['locale', 'editorialType', 'category', 'tags', 'authorName', 'dataDate', 'publicationAuthorization', 'coverId', 'coverAlt', 'methodology', 'scope', 'limitations', 'references', 'featured', 'noIndex'].forEach((name) => form().elements[name]?.addEventListener('input', () => { markDirty(); updateDerived(); }));
window.addEventListener('beforeunload', (event) => { if (state.dirty) { event.preventDefault(); event.returnValue = ''; } });
api('/editorial-portal/session/me').then(async (result) => { $('#login-view').hidden = true; $('#portal-view').hidden = false; $('#user-name').textContent = result.data?.firstname ? `${result.data.firstname} ${result.data.lastname || ''}` : ''; showView('dashboard'); await loadMedia(); await loadPublications(); }).catch(() => showLogin());
