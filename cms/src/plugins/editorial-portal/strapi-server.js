'use strict';

const UID = 'api::publication.publication';

const safePublication = (entry) => ({
  documentId: entry.documentId,
  title: entry.title,
  slug: entry.slug,
  editorialType: entry.editorialType,
  category: entry.category,
  excerpt: entry.excerpt,
  locale: entry.locale,
  publishedAt: entry.publishedAt,
  updatedAt: entry.updatedAt,
  localizations: (entry.localizations || []).map((item) => ({ locale: item.locale, publishedAt: item.publishedAt })),
});

module.exports = () => ({
  controllers: {
    editorial: ({ strapi }) => ({
      async list(ctx) {
        const entries = await strapi.documents(UID).findMany({ locale: 'fr', status: 'draft', sort: ['updatedAt:desc'], limit: 50, populate: ['localizations'] });
        ctx.body = { data: entries.map(safePublication) };
      },
      async create(ctx) {
        const input = ctx.request.body?.data || {};
        const required = ['title', 'slug', 'excerpt', 'editorialType', 'category'];
        if (required.some((field) => typeof input[field] !== 'string' || !input[field].trim())) return ctx.badRequest('Titre, résumé, format et catégorie sont obligatoires.');
        const document = await strapi.documents(UID).create({
          locale: 'fr',
          status: 'draft',
          data: {
            title: input.title.trim(),
            slug: input.slug.trim(),
            excerpt: input.excerpt.trim(),
            editorialType: input.editorialType,
            category: input.category.trim(),
            authorName: 'Brice Merlin MIAFFO',
            content: [{ __component: 'publication.rich-text', text: input.excerpt.trim() }],
          },
        });
        ctx.body = { data: safePublication(document) };
      },
      async publish(ctx) {
        const document = await strapi.documents(UID).publish({ documentId: ctx.params.documentId, locale: 'fr' });
        ctx.body = { data: safePublication(document) };
      },
      async unpublish(ctx) {
        const document = await strapi.documents(UID).unpublish({ documentId: ctx.params.documentId, locale: 'fr' });
        ctx.body = { data: safePublication(document) };
      },
    }),
  },
  routes: [
    { method: 'GET', path: '/publications', handler: 'editorial.list' },
    { method: 'POST', path: '/publications', handler: 'editorial.create' },
    { method: 'POST', path: '/publications/:documentId/publish', handler: 'editorial.publish' },
    { method: 'POST', path: '/publications/:documentId/unpublish', handler: 'editorial.unpublish' },
  ],
});
