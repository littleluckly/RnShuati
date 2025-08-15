This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

#### 字体图标问题

安装了 react-native-vector-icons 字体图标，但是不显示，可能是字体没有被打包，手动复制一份
`cp node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf android/app/src/main/assets/fonts/`
如果目录不存在，可以先创建目录`android/app/src/main/assets/fonts/`

#### react-native-reanimated 安装问题

参考链接https://github.com/software-mansion/react-native-reanimated/issues/6492
出问题的背景：react@18.3.1 react-native@0.75.2环境，使用 npm 安装 react-native-reanimated@3.16.0 报错

```bash
ERROR  ReanimatedError: [Reanimated] Native part of Reanimated doesn't seem to be initialized (Worklets).
See https://docs.swmansion.com/react-native-reanimated/docs/guides/troubleshooting#native-part-of-reanimated-doesnt-seem-to-be-initialized Troubleshooting | React Native Reanimated Troubleshooting | React Native Reanimated   for more details., js engine: hermes [Component Stack]
 ERROR  Warning: TypeError: Cannot read property 'makeMutable' of undefined
```

解决思路：
清理依赖
`rm -rf nodemodules package-lock.json`
`npm cache clean --force`（这一步可选）
使用 yarn 安装依赖

```bash
yarn install
cd ios && pod install && cd .. # ios
```

使用 yarn 安装
`react-native-reanimated@3.16.0`

配置`metro.config.js`

```javascript
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const config = {};
module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

配置`babel.config.js`

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ...其他配置
    'react-native-reanimated/plugin', // 必须放最后
  ],
};
```

重启 metro
`npx react-native start --reset-cache`
重新编译 android
`cd android && ./gradlew clean && cd ..`
`npx react-native run-android   # 或 run-ios`

如果还报错再执行`yarn config set nodeLinker node-modules`

#### 引入 gesture 后报错

报一堆奇怪的错误，大概率就是版本和 react-native 不匹配，
version react-native version
2.28.0+ 0.79.0+
2.26.0+ 0.78.0+
2.25.0+ 0.76.0+
2.24.0+ 0.75.0+

#### 加了阴影 elevation 没有效果

android 端，elevation 必须和 backgroundColor 配套使用
ios 端，使用 shadowColor
shadowOffset
shadowOpacity
shadowRadius

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
