import type { LinkingOptions, ParamListBase } from '@react-navigation/native';

export const navigationLinking: LinkingOptions<ParamListBase> = {
  prefixes: ['meuagito://', 'https://app.meuagito.com'],
  config: {
    screens: {
      Login: 'login',
      VerifyEmail: 'verify-email',
      ForgotPassword: 'reset-password',
      ProfileSelection: 'profile-selection',
      Notifications: 'notifications',
      Catalog: 'catalog/:establishmentId?',
      Item: 'item/:itemType/:itemId',
      MainTabs: 'app',
    },
  },
};
