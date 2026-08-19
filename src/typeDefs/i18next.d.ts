import 'react-i18next';
import common from '../locales/en/common.json';
import sidebar from '../locales/en/sidebar.json';
import households from '../locales/en/households.json';
import supermarkets from '../locales/en/supermarkets.json';
import overview from '../locales/en/overview.json';
import categories from '../locales/en/categories.json';
import preferences from '../locales/en/preferences.json';
import offers from '../locales/en/offers.json';
import stats from '../locales/en/stats.json';
import auth from '../locales/en/auth.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      sidebar: typeof sidebar;
      households: typeof households;
      supermarkets: typeof supermarkets;
      overview: typeof overview;
      categories: typeof categories;
      preferences: typeof preferences;
      offers: typeof offers;
      stats: typeof stats;
      auth: typeof auth;
    };
  }
}
