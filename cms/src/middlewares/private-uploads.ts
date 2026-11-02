import type { Core } from '@strapi/strapi';

const privateUploads: Core.MiddlewareFactory = () => async (ctx, next) => {
  if (ctx.path === '/uploads' || ctx.path.startsWith('/uploads/')) return ctx.notFound('Fichier introuvable.');
  await next();
};

export default privateUploads;
