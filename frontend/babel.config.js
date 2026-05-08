module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@screens': './src/screens',
          '@components': './src/components',
          '@services': './src/services',
          '@stores': './src/stores',
          '@store': './src/store',
          '@hooks': './src/hooks',
          '@constants': './src/constants',
          '@config': './src/config',
          '@dev': './src/dev',
          '@utils': './src/utils',
          '@types': './src/types',
          '@assets': './assets',
        },
      }],
      'react-native-reanimated/plugin',
    ],
  };
};
