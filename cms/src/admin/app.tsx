import type { StrapiApp } from '@strapi/strapi/admin';
import editorialPortal from '../plugins/editorial-portal/admin/src';

export default {
  config: {
    locales: ['fr', 'en'],
  },
  register(app: StrapiApp) {
    editorialPortal.register(app);
  },
  bootstrap() {},
};
