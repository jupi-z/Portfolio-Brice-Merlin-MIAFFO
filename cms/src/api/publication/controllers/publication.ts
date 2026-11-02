import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::publication.publication', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, status: 'published' };
    return super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query = { ...ctx.query, status: 'published' };
    return super.findOne(ctx);
  },
}));
