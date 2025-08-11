module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'], // 指定源代码根目录，通常为 src
        alias: {
          // 配置 @ 指向 src 目录
          '@': './src',
          // 你也可以配置其他别名，例如：
          // '@assets': './src/assets',
          // '@components': './src/components',
          // '@screens': './src/screens',
          // '@utils': './src/utils',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
