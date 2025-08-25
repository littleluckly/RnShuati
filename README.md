# TestApp React Native 项目

这是一个新的 [**React Native**](https://reactnative.dev) 项目，使用 [`@react-native-community/cli`](https://github.com/react-native-community/cli) 脚手架创建。

# 开始使用

> **注意**: 在继续之前，请确保您已完成 [React Native - 环境设置](https://reactnative.dev/docs/environment-setup) 说明中"创建新应用程序"步骤之前的所有内容。

## 步骤 1: 启动 Metro 服务器

首先，您需要启动 **Metro**，这是 React Native 自带的 JavaScript _打包工具_。

要启动 Metro，请从 React Native 项目的 _根目录_ 运行以下命令：

```bash
# 使用 npm
npm start

# 或者使用 Yarn
yarn start
```

## 步骤 2: 启动您的应用程序

让 Metro 打包工具在其 _自己的终端_ 中运行。从 React Native 项目的 _根目录_ 打开一个 _新的终端_。运行以下命令来启动您的 _Android_ 或 _iOS_ 应用：

### Android 版本

```bash
# 使用 npm
npm run android

# 或者使用 Yarn
yarn android
```

### iOS 版本

```bash
# 使用 npm
npm run ios

# 或者使用 Yarn
yarn ios
```

如果一切设置 _正确_，您应该很快就能在 _Android 模拟器_ 或 _iOS 模拟器_ 中看到您的新应用运行，前提是您已正确设置了模拟器。

这是运行应用的一种方式——您也可以分别从 Android Studio 和 Xcode 中直接运行它。

## 步骤 3: 修改您的应用

现在您已经成功运行了应用，让我们来修改它。

1. 在您选择的文本编辑器中打开 `App.tsx` 并编辑一些行。
2. **Android**: 按 <kbd>R</kbd> 键两次或从 **开发者菜单** 中选择 **"重新加载"** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows 和 Linux) 或 <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS)) 来查看您的更改！

   **iOS**: 在 iOS 模拟器中按 <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> 重新加载应用并查看您的更改！

## 恭喜！ :tada:

您已成功运行并修改了您的 React Native 应用。 :partying_face:

### 接下来做什么？

- 如果您想将此新的 React Native 代码添加到现有应用程序中，请查看 [集成指南](https://reactnative.dev/docs/integration-with-existing-apps)。
- 如果您想了解更多关于 React Native 的信息，请查看 [React Native 介绍](https://reactnative.dev/docs/getting-started)。

# 故障排除

如果您无法使其正常工作，请查看 [故障排除](https://reactnative.dev/docs/troubleshooting) 页面。

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
ios 端，使用

```
shadowColor
shadowOffset
shadowOpacity
shadowRadius
```

#### 图标

首先安装依赖`yarn add react-native-vector-icons`, 不同图标有不同的使用方式

```ts
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
```

`https://oblador.github.io/react-native-vector-icons/`
`https://ionic.io/ionicons`

#### 语音合成

python 环境安装 `brew install python`
验证安装 `python3 --version
pip3 --version`

使用虚拟环境安装开源语音 edge-tts
✅ 优点：安全、隔离、不污染系统、符合现代 Python 开发规范。

```bash
# 1. 创建一个虚拟环境（比如叫 venv 或 tts-env）
python3 -m venv ~/venv-tts

# 2. 激活它
source ~/venv-tts/bin/activate

# 3. 现在可以正常安装 edge-tts
pip install edge-tts

# 4. 使用完成后退出
deactivate
```

# 了解更多

要了解更多关于 React Native 的信息，请查看以下资源：

- [React Native 官网](https://reactnative.dev) - 了解更多关于 React Native 的信息。
- [入门指南](https://reactnative.dev/docs/environment-setup) - React Native **概述**以及如何设置您的环境。
- [学习基础知识](https://reactnative.dev/docs/getting-started) - React Native **基础知识**的**引导教程**。
- [博客](https://reactnative.dev/blog) - 阅读最新的官方 React Native **博客**文章。
- [`@facebook/react-native`](https://github.com/facebook/react-native) - React Native 的开源 GitHub **代码库**。
