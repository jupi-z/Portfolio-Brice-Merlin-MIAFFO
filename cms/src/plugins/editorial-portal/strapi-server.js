'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  EDITORIAL_ACCESS_COOKIE,
  EDITORIAL_REFRESH_COOKIE,
  createEditorialCookieOptions,
  readCookieToken,
} = require('./session');

const UID = 'api::publication.publication';
const ADMIN_SESSION_TTL_SECONDS = 15 * 60;
const ADMIN_REFRESH_TTL_SECONDS = 12 * 60 * 60;
const PUBLICATION_TYPES = new Set(['article', 'study', 'note', 'case-study', 'guide', 'intervention']);
const LOCALES = new Set(['fr', 'en']);
const editorialRoles = () => new Set((process.env.EDITORIAL_ALLOWED_ROLES || 'Super Admin,Editorial Editor').split(',').map((role) => role.trim()).filter(Boolean));

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeTags = (value) => Array.isArray(value) ? value.map(normalizeText).filter(Boolean).slice(0, 30) : [];
const normalizeJsonList = (value) => Array.isArray(value) ? value : [];

const safePublication = (entry) => ({
  documentId: entry.documentId,
  title: entry.title || '',
  slug: entry.slug || '',
  eyebrow: entry.eyebrow || '',
  editorialType: entry.editorialType,
  category: entry.category || '',
  excerpt: entry.excerpt || '',
  content: (entry.content || []).map((block) => {
    if (block?.__component === 'publication.image' && block.image) return { ...block, image: safeMedia(block.image) };
    if (block?.__component === 'publication.download' && block.file) return { ...block, file: safeMedia(block.file) };
    return block;
  }),
  cover: entry.cover ? safeMedia(entry.cover) : null,
  coverAlt: entry.coverAlt || '',
  authorName: entry.authorName || 'Brice Merlin MIAFFO',
  tags: entry.tags || [],
  readingTime: entry.readingTime || null,
  featured: Boolean(entry.featured),
  references: entry.references || [],
  related: entry.related || [],
  methodology: entry.methodology || '',
  scope: entry.scope || '',
  dataDate: entry.dataDate || null,
  limitations: entry.limitations || '',
  publicationAuthorization: entry.publicationAuthorization || 'not-required',
  seo: entry.seo || null,
  locale: entry.locale,
  status: entry.publishedAt ? 'published' : 'draft',
  publishedAt: entry.publishedAt,
  updatedAt: entry.updatedAt,
  createdAt: entry.createdAt,
  localizations: (entry.localizations || []).map((item) => ({ documentId: item.documentId, locale: item.locale, title: item.title, slug: item.slug, publishedAt: item.publishedAt })),
});

const safeMedia = (file) => ({ id: file.id, name: file.name, url: `/editorial-portal/media/${file.id}/file`, mime: file.mime, size: file.size, width: file.width, height: file.height, createdAt: file.createdAt });

const publicationData = (input, existing = {}) => ({
  title: normalizeText(input.title ?? existing.title),
  slug: normalizeText(input.slug ?? existing.slug),
  eyebrow: normalizeText(input.eyebrow ?? existing.eyebrow),
  excerpt: normalizeText(input.excerpt ?? existing.excerpt),
  content: Array.isArray(input.content) ? input.content : (existing.content || []),
  cover: input.coverId ? Number(input.coverId) : (input.cover !== undefined ? input.cover : existing.cover),
  coverAlt: normalizeText(input.coverAlt ?? existing.coverAlt),
  authorName: normalizeText(input.authorName ?? existing.authorName) || 'Brice Merlin MIAFFO',
  editorialType: normalizeText(input.editorialType ?? existing.editorialType),
  category: normalizeText(input.category ?? existing.category),
  tags: normalizeTags(input.tags ?? existing.tags),
  readingTime: input.readingTime === '' || input.readingTime == null ? null : Number(input.readingTime),
  featured: Boolean(input.featured ?? existing.featured),
  references: normalizeJsonList(input.references ?? existing.references),
  related: normalizeJsonList(input.related ?? existing.related),
  methodology: normalizeText(input.methodology ?? existing.methodology),
  scope: normalizeText(input.scope ?? existing.scope),
  dataDate: input.dataDate || existing.dataDate || null,
  limitations: normalizeText(input.limitations ?? existing.limitations),
  publicationAuthorization: normalizeText(input.publicationAuthorization ?? existing.publicationAuthorization) || 'not-required',
  seo: input.seo !== undefined ? input.seo : existing.seo,
});

const validatePublication = (data, locale, ctx) => {
  if (!data.title || !data.slug || !data.excerpt || !data.category) return ctx.badRequest('Le titre, le slug, le résumé et la catégorie sont obligatoires.');
  if (!PUBLICATION_TYPES.has(data.editorialType)) return ctx.badRequest('Le format de publication est invalide.');
  if (!Array.isArray(data.content) || data.content.length === 0) return ctx.badRequest('Ajoutez au moins un bloc de contenu.');
  for (const block of data.content) {
    if (block?.__component === 'publication.image' && (!block.image || (!Number.isInteger(Number(block.image)) && !block.image?.id))) {
      return ctx.badRequest('Sélectionnez une image pour chaque bloc image.');
    }
    if (block?.__component === 'publication.download' && (!block.file || (!Number.isInteger(Number(block.file)) && !block.file?.id))) {
      return ctx.badRequest('Sélectionnez un PDF pour chaque bloc téléchargement.');
    }
  }
  if (data.readingTime !== null && (!Number.isInteger(data.readingTime) || data.readingTime < 1 || data.readingTime > 180)) return ctx.badRequest('Le temps de lecture doit être compris entre 1 et 180 minutes.');
  if (!LOCALES.has(locale)) return ctx.badRequest('La langue demandée est invalide.');
};

const sessionManager = (strapi) => strapi.sessionManager('admin');
const safeUser = (strapi, user) => strapi.service('admin::user').sanitizeUser(user);
const findPublication = async (strapi, documentId, locale, status, populate = []) => {
  const results = await strapi.documents(UID).findMany({ filters: { documentId: { $eq: documentId } }, locale, status, limit: 1, populate });
  return results[0] || null;
};
const mediaFilePath = (strapi, file) => {
  const publicRoot = path.resolve(strapi.dirs.static.public);
  const relative = String(file?.url || '').replace(/^[/\\]+/, '');
  const resolved = path.resolve(publicRoot, relative);
  return resolved.startsWith(`${publicRoot}${path.sep}`) ? resolved : null;
};
const streamMedia = (ctx, strapi, file, disposition = 'inline') => {
  const filePath = mediaFilePath(strapi, file);
  if (!filePath || !fs.existsSync(filePath)) return ctx.notFound('Fichier introuvable.');
  ctx.type = file.mime || 'application/octet-stream';
  ctx.set('Content-Disposition', `${disposition}; filename="${String(file.name || 'media').replace(/["\r\n]/g, '')}"`);
  ctx.body = fs.createReadStream(filePath);
};
const publicationUsesMedia = (publication, mediaId) => {
  if (Number(publication?.cover?.id) === Number(mediaId)) return true;
  return (publication?.content || []).some((block) => Number(block?.image?.id || block?.image) === Number(mediaId) || Number(block?.file?.id || block?.file) === Number(mediaId));
};
const findPublicationsByStatus = async (strapi, status) => {
  const populate = { cover: true, content: { on: { 'publication.image': { populate: ['image'] }, 'publication.download': { populate: ['file'] } } } };
  const publications = await Promise.all([...LOCALES].map((locale) => strapi.documents(UID).findMany({ status, locale, limit: 10000, populate })));
  return publications.flat();
};
const publishedMediaIsPublic = async (strapi, mediaId) => {
  const publications = await findPublicationsByStatus(strapi, 'published');
  return publications.some((publication) => publicationUsesMedia(publication, mediaId));
};

const cookieAuth = (_config, { strapi }) => async (ctx, next) => {
  const origin = ctx.get('origin');
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(ctx.method) && origin && origin !== `${ctx.protocol}://${ctx.host}`) return ctx.forbidden('Origine non autorisée.');
  const token = ctx.cookies.get(EDITORIAL_ACCESS_COOKIE) || readCookieToken(ctx.request.headers.cookie || '');
  if (!token) return ctx.unauthorized('Connexion requise.');
  const manager = sessionManager(strapi);
  const validation = manager?.validateAccessToken(token);
  if (!validation?.isValid || !(await manager.isSessionActive(validation.payload.sessionId))) return ctx.unauthorized('Votre session a expiré.');
  const user = await strapi.service('admin::user').findOne(validation.payload.userId, ['roles']);
  if (!user || user.isActive !== true) return ctx.unauthorized('Compte inactif.');
  const roles = Array.isArray(user.roles) ? user.roles : [];
  if (!roles.some((role) => editorialRoles().has(role.name) || editorialRoles().has(role.code))) return ctx.forbidden('Ce compte ne dispose pas des droits éditoriaux.');
  ctx.state.user = user;
  ctx.state.session = { id: validation.payload.sessionId };
  ctx.state.userAbility = await strapi.service('admin::permission').engine.generateUserAbility(user);
  await next();
};

const controllerFactory = ({ strapi }) => ({
  async login(ctx) {
    const email = normalizeText(ctx.request.body?.email).toLowerCase();
    const password = typeof ctx.request.body?.password === 'string' ? ctx.request.body.password : '';
    if (!email || !password) return ctx.badRequest('Saisissez votre email et votre mot de passe.');
    const [, user] = await strapi.service('admin::auth').checkCredentials({ email, password });
    if (!user) return ctx.unauthorized('Email ou mot de passe incorrect.');
    const manager = sessionManager(strapi);
    const deviceId = `editorial-${crypto.randomUUID()}`;
    const refresh = await manager.generateRefreshToken(String(user.id), deviceId, { type: 'session', metadata: { source: 'editorial-portal' } });
    const access = await manager.generateAccessToken(refresh.token);
    if ('error' in access) return ctx.internalServerError('La session n’a pas pu être créée.');
    const secure = Boolean(ctx.request.secure || process.env.NODE_ENV === 'production');
    ctx.cookies.set(EDITORIAL_REFRESH_COOKIE, refresh.token, { ...createEditorialCookieOptions(secure, ADMIN_REFRESH_TTL_SECONDS), path: '/' });
    ctx.cookies.set(EDITORIAL_ACCESS_COOKIE, access.token, createEditorialCookieOptions(secure, ADMIN_SESSION_TTL_SECONDS));
    ctx.body = { data: { user: safeUser(strapi, user) } };
  },

  async logout(ctx) {
    const token = ctx.cookies.get(EDITORIAL_ACCESS_COOKIE);
    try {
      const validation = token ? sessionManager(strapi).validateAccessToken(token) : null;
      if (validation?.isValid) await sessionManager(strapi).revokeSessionById(String(validation.payload.userId), validation.payload.sessionId);
    } catch (error) {
      strapi.log.warn(`Editorial session logout cleanup failed: ${error.message}`);
    }
    ctx.cookies.set(EDITORIAL_ACCESS_COOKIE, '', { ...createEditorialCookieOptions(false, 0), expires: new Date(0) });
    ctx.cookies.set(EDITORIAL_REFRESH_COOKIE, '', { ...createEditorialCookieOptions(false, 0), expires: new Date(0) });
    ctx.body = { data: true };
  },

  async refresh(ctx) {
    const token = ctx.cookies.get(EDITORIAL_REFRESH_COOKIE);
    if (!token) return ctx.unauthorized('Connexion requise.');
    const access = await sessionManager(strapi).generateAccessToken(token);
    if (!access || 'error' in access) return ctx.unauthorized('Votre session a expiré.');
    const secure = Boolean(ctx.request.secure || process.env.NODE_ENV === 'production');
    ctx.cookies.set(EDITORIAL_ACCESS_COOKIE, access.token, createEditorialCookieOptions(secure, ADMIN_SESSION_TTL_SECONDS));
    ctx.body = { data: true };
  },

  async me(ctx) { ctx.body = { data: safeUser(strapi, ctx.state.user) }; },

  async media(ctx) {
    const files = await strapi.db.query('plugin::upload.file').findMany({ orderBy: { createdAt: 'desc' }, limit: 100 });
    ctx.body = { data: files.map(safeMedia) };
  },

  async file(ctx) {
    const file = await strapi.db.query('plugin::upload.file').findOne({ where: { id: Number(ctx.params.id) } });
    if (!file) return ctx.notFound('Fichier introuvable.');
    streamMedia(ctx, strapi, file);
  },

  async publicMedia(ctx) {
    const file = await strapi.db.query('plugin::upload.file').findOne({ where: { id: Number(ctx.params.id) } });
    if (!file || !(await publishedMediaIsPublic(strapi, file.id))) return ctx.notFound('Fichier introuvable.');
    streamMedia(ctx, strapi, file);
  },

  async upload(ctx) {
    const incoming = ctx.request.files?.files || ctx.request.files?.file;
    const files = Array.isArray(incoming) ? incoming : incoming ? [incoming] : [];
    if (!files.length) return ctx.badRequest('Sélectionnez au moins un fichier.');
    for (const file of files) {
      const size = Number(file.size || file.sizeInBytes || 0);
      const mime = String(file.mimetype || file.mime || file.type || '').toLowerCase();
      const extension = path.extname(String(file.name || file.originalFilename || '')).toLowerCase();
      if (size > 12 * 1024 * 1024) return ctx.badRequest('Chaque fichier doit faire moins de 12 Mo.');
      const validMime = /^(image\/(jpeg|png|webp|avif)|application\/pdf)$/.test(mime);
      const validExtension = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.pdf'].includes(extension);
      if (!validMime || !validExtension) return ctx.badRequest('Formats acceptés : JPG, PNG, WebP, AVIF et PDF.');
    }
    const uploaded = await strapi.plugin('upload').service('upload').upload({ data: {}, files });
    ctx.body = { data: uploaded.map(safeMedia) };
  },

  async deleteMedia(ctx) {
    const file = await strapi.db.query('plugin::upload.file').findOne({ where: { id: Number(ctx.params.id) } });
    if (!file) return ctx.notFound('Fichier introuvable.');
    const publications = await findPublicationsByStatus(strapi, 'draft');
    if (publications.some((publication) => publicationUsesMedia(publication, file.id))) return ctx.conflict('Ce média est utilisé par une publication. Retirez-le de la publication avant de le supprimer.');
    await strapi.plugin('upload').service('upload').remove(file);
    ctx.body = { data: true };
  },

  async list(ctx) {
    const requestQuery = ctx.request.query || {};
    const page = Math.max(1, Number(requestQuery.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(requestQuery.pageSize || 12)));
    const filters = { locale: 'fr' };
    if (requestQuery.status === 'published') filters.publishedAt = { $notNull: true };
    if (requestQuery.status === 'draft') filters.publishedAt = { $null: true };
    if (requestQuery.type && PUBLICATION_TYPES.has(requestQuery.type)) filters.editorialType = requestQuery.type;
    if (requestQuery.category) filters.category = { $containsi: normalizeText(requestQuery.category) };
    if (requestQuery.search) filters.$or = [{ title: { $containsi: normalizeText(requestQuery.search) } }, { excerpt: { $containsi: normalizeText(requestQuery.search) } }];
    const result = await strapi.service(UID).find({ locale: 'fr', status: 'draft', filters, sort: ['updatedAt:desc'], populate: ['localizations', 'cover', 'seo', 'content'], pagination: { page, pageSize } });
    const results = result.results || [];
    const pagination = result.pagination || { page, pageSize, pageCount: results.length === pageSize ? page + 1 : page, total: results.length };
    ctx.body = { data: results.map(safePublication), meta: { page: pagination.page, pageSize: pagination.pageSize, pageCount: Math.max(1, pagination.pageCount), total: pagination.total } };
  },

  async get(ctx) {
    const locale = LOCALES.has(ctx.request.query?.locale) ? ctx.request.query.locale : 'fr';
    const document = await findPublication(strapi, ctx.params.documentId, locale, 'draft', ['localizations', 'cover', 'seo', 'content']);
    if (!document) return ctx.notFound('Publication introuvable.');
    ctx.body = { data: safePublication(document) };
  },

  async preview(ctx) {
    const locale = LOCALES.has(ctx.request.query?.locale) ? ctx.request.query.locale : 'fr';
    const document = await findPublication(strapi, ctx.params.documentId, locale, 'draft', ['localizations', 'cover', 'seo', 'content']);
    if (!document) return ctx.notFound('Brouillon introuvable.');
    ctx.body = { data: safePublication(document), preview: true };
  },

  async create(ctx) {
    const input = ctx.request.body?.data || {};
    const locale = LOCALES.has(ctx.request.body?.locale) ? ctx.request.body.locale : 'fr';
    const data = publicationData(input, { content: [{ __component: 'publication.rich-text', text: normalizeText(input.excerpt) }] });
    validatePublication(data, locale, ctx);
    const created = await strapi.documents(UID).create({ locale, status: 'draft', data });
    const document = await findPublication(strapi, created.documentId, locale, 'draft', ['localizations', 'cover', 'seo', 'content']);
    ctx.body = { data: safePublication(document || created) };
  },

  async update(ctx) {
    const locale = LOCALES.has(ctx.request.body?.locale) ? ctx.request.body.locale : 'fr';
    const current = await findPublication(strapi, ctx.params.documentId, locale, 'draft', ['cover', 'seo', 'content']);
    if (!current) return ctx.notFound('Publication introuvable.');
    const data = publicationData(ctx.request.body?.data || {}, current);
    validatePublication(data, locale, ctx);
    await strapi.documents(UID).update({ documentId: ctx.params.documentId, locale, status: 'draft', data });
    const document = await findPublication(strapi, ctx.params.documentId, locale, 'draft', ['localizations', 'cover', 'seo', 'content']);
    ctx.body = { data: safePublication(document) };
  },

  async translate(ctx) {
    const input = ctx.request.body?.data || {};
    const source = await findPublication(strapi, ctx.params.documentId, 'fr', 'draft', ['content', 'seo']);
    if (!source) return ctx.notFound('Publication source introuvable.');
    const data = publicationData(input, source);
    validatePublication(data, 'en', ctx);
    await strapi.documents(UID).update({ documentId: ctx.params.documentId, locale: 'en', status: 'draft', data });
    const document = await findPublication(strapi, ctx.params.documentId, 'en', 'draft', ['localizations', 'cover', 'seo', 'content']);
    ctx.body = { data: safePublication(document) };
  },

  async publish(ctx) {
    const locale = LOCALES.has(ctx.request.body?.locale) ? ctx.request.body.locale : 'fr';
    await strapi.documents(UID).publish({ documentId: ctx.params.documentId, locale });
    const document = await findPublication(strapi, ctx.params.documentId, locale, 'published', ['localizations', 'cover', 'seo', 'content']);
    ctx.body = { data: safePublication(document) };
  },

  async unpublish(ctx) {
    const locale = LOCALES.has(ctx.request.body?.locale) ? ctx.request.body.locale : 'fr';
    await strapi.documents(UID).unpublish({ documentId: ctx.params.documentId, locale });
    const document = await findPublication(strapi, ctx.params.documentId, locale, 'draft', ['localizations', 'cover', 'seo', 'content']);
    ctx.body = { data: safePublication(document) };
  },

  async delete(ctx) {
    await strapi.documents(UID).delete({ documentId: ctx.params.documentId, locale: '*' });
    ctx.body = { data: true };
  },
});

module.exports = () => ({
  controllers: { editorial: controllerFactory },
  middlewares: { cookieAuth },
  routes: [
    { method: 'POST', path: '/session', handler: 'editorial.login', config: { auth: false } },
    { method: 'POST', path: '/session/refresh', handler: 'editorial.refresh', config: { auth: false } },
    { method: 'POST', path: '/session/logout', handler: 'editorial.logout', config: { auth: false } },
    { method: 'GET', path: '/session/me', handler: 'editorial.me', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'GET', path: '/media', handler: 'editorial.media', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'GET', path: '/media/:id/file', handler: 'editorial.file', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'GET', path: '/public-media/:id', handler: 'editorial.publicMedia', config: { auth: false } },
    { method: 'POST', path: '/media', handler: 'editorial.upload', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'], parser: { enabled: true } } },
    { method: 'DELETE', path: '/media/:id', handler: 'editorial.deleteMedia', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'GET', path: '/publications', handler: 'editorial.list', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'GET', path: '/publications/:documentId', handler: 'editorial.get', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'GET', path: '/preview/:documentId', handler: 'editorial.preview', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'POST', path: '/publications', handler: 'editorial.create', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'PUT', path: '/publications/:documentId', handler: 'editorial.update', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'POST', path: '/publications/:documentId/translate', handler: 'editorial.translate', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'POST', path: '/publications/:documentId/publish', handler: 'editorial.publish', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'POST', path: '/publications/:documentId/unpublish', handler: 'editorial.unpublish', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
    { method: 'DELETE', path: '/publications/:documentId', handler: 'editorial.delete', config: { auth: false, middlewares: ['plugin::editorial-portal.cookieAuth'] } },
  ],
});
