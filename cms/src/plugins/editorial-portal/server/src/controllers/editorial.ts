const UID = 'api::publication.publication';

const safePublication = (entry: any) => ({
  documentId: entry.documentId,
  title: entry.title,
  slug: entry.slug,
  editorialType: entry.editorialType,
  category: entry.category,
  excerpt: entry.excerpt,
  locale: entry.locale,
  publishedAt: entry.publishedAt,
  updatedAt: entry.updatedAt,
  localizations: (entry.localizations || []).map((item: any) => ({ locale: item.locale, publishedAt: item.publishedAt })),
});

export default {
  async list(ctx: any) {
    const entries = await strapi.documents(UID).findMany({
      locale: 'fr',
      status: 'draft',
      sort: ['updatedAt:desc'],
      limit: 50,
      populate: ['localizations'],
    });
    ctx.body = { data: entries.map(safePublication) };
  },

  async create(ctx: any) {
    const input = ctx.request.body?.data || {};
    const required = ['title', 'slug', 'excerpt', 'editorialType', 'category'];
    if (required.some((field) => typeof input[field] !== 'string' || !input[field].trim())) {
      return ctx.badRequest('Titre, résumé, format et catégorie sont obligatoires.');
    }
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
};
