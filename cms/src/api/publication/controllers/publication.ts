import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::publication.publication', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, status: 'published' };
    const controller = this as any;
    const sanitizedQuery = await controller.sanitizeQuery(ctx);
    const { results, pagination } = await strapi.service('api::publication.publication').find(sanitizedQuery);
    const sanitizedResults = await controller.sanitizeOutput(results, ctx);
    return controller.transformResponse(sanitizedResults, { pagination });
  },
  async findOne(ctx) {
    ctx.query = { ...ctx.query, status: 'published' };
    const controller = this as any;
    const sanitizedQuery = await controller.sanitizeQuery(ctx);
    const result = await strapi.service('api::publication.publication').findOne(ctx.params.id, sanitizedQuery);
    const sanitizedResult = await controller.sanitizeOutput(result, ctx);
    return controller.transformResponse(sanitizedResult);
  },
}));
