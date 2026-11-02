import type { StrapiApp } from '@strapi/strapi/admin';
import { PLUGIN_ID } from './pluginId';
import PluginIcon from './components/PluginIcon';
import Initializer from './components/Initializer';

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Espace éditorial',
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component.default;
      },
    });
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: true,
      name: PLUGIN_ID,
    });
  },
  bootstrap() {},
  async registerTrads({ locales }: { locales: string[] }) {
    return locales.map((locale) => ({ locale, data: {} }));
  },
};
