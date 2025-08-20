export default [
  {
    id: 'a1b2c3d4',
    question: 'React Native 如何实现跨平台？',
    shortAnswer: '通过桥接将 JS 调用转为原生组件和 API。',
    fullAnswer:
      'React Native 利用 JavaScriptCore / Hermes 引擎执行 JS，再通过 C++ 桥把 React 组件映射为原生 View，把 JS 函数映射为原生 Module，从而实现跨平台。',
  },
  {
    id: 'e5f6g7h8',
    question: 'Expo 和纯 React Native 有什么区别？',
    shortAnswer: 'Expo 提供了更多开箱即用的功能和托管服务。',
    fullAnswer:
      'Expo 是基于 React Native 的框架，封装了常用原生功能（如相机、推送），无需原生代码即可使用。纯 RN 需要自己配置原生模块，更灵活但复杂度高。',
  },
  {
    id: 'i9j0k1l2',
    question: 'React Native 中的 Flexbox 布局如何工作？',
    shortAnswer: '基于 Yoga 引擎实现与 Web 类似的 Flexbox 布局。',
    fullAnswer:
      'React Native 使用 Yoga 布局引擎，支持大部分 CSS Flexbox 特性，如 flexDirection、justifyContent、alignItems，用于构建响应式移动端 UI。',
  },
  {
    id: 'm3n4o5p6',
    question: '如何在 React Native 中管理状态？',
    shortAnswer: '可用 useState、Redux、MobX 或 Context API。',
    fullAnswer:
      '小型应用可用 useState 和 useReducer；中大型项目推荐 Redux Toolkit 或 Zustand；跨组件共享状态可用 Context API 配合 useReducer。',
  },
  {
    id: 'q7r8s9t0',
    question: 'React Native 如何调用原生模块？',
    shortAnswer: '通过原生桥接（Native Bridge）暴露方法。',
    fullAnswer:
      'iOS 使用 Objective-C/Swift 创建 RCTBridgeModule，Android 使用 Java/Kotlin 创建 NativeModule，然后在 JS 中通过 NativeModules 调用。',
  },
  {
    id: 'u1v2w3x4',
    question: 'React Native 支持 TypeScript 吗？',
    shortAnswer: '完全支持，官方推荐使用。',
    fullAnswer:
      'React Native 项目可使用 TypeScript，通过 tsconfig.json 配置类型检查，提升代码可维护性和开发体验，社区生态也广泛支持 TS。',
  },
  {
    id: 'y5z6a7b8',
    question: '如何优化 React Native 应用性能？',
    shortAnswer: '避免频繁重渲染，使用 FlatList，启用 Hermes。',
    fullAnswer:
      '使用 React.memo、useCallback 避免不必要的渲染；列表用 FlatList 而非 ScrollView；启用 Hermes 引擎提升 JS 执行速度；减少桥接调用。',
  },
  {
    id: 'c9d0e1f2',
    question: 'React Native 中的 StyleSheet 有什么作用？',
    shortAnswer: '用于定义组件样式，提升性能和可读性。',
    fullAnswer:
      'StyleSheet.create 创建一个样式对象，React Native 会在原生端优化这些样式，避免每次渲染重新计算，同时提供类型检查和语法高亮。',
  },
  {
    id: 'g3h4i5j6',
    question: '如何在 React Native 中处理导航？',
    shortAnswer: '常用 React Navigation 实现页面跳转。',
    fullAnswer:
      'React Navigation 是最流行的导航库，支持 Stack、Tab、Drawer 等导航器，通过 Navigator 和 Screen 组件定义路由结构。',
  },
  {
    id: 'k7l8m9n0',
    question: 'React Native 如何发送网络请求？',
    shortAnswer: '使用 fetch 或 axios 发起 HTTP 请求。',
    fullAnswer:
      '可直接使用全局 fetch API，或使用 axios 进行更复杂的请求管理，如拦截器、超时、错误重试等。',
  },
  {
    id: 'o1p2q3r4',
    question: 'React Native 如何实现热更新？',
    shortAnswer: '通过 CodePush 或自建更新机制。',
    fullAnswer:
      'Microsoft CodePush 支持 JS 和资源文件的远程更新，无需发布新版本即可推送修复。Expo 也有类似的 OTA 更新功能。',
  },
  {
    id: 's5t6u7v8',
    question: 'React Native 支持 Web 平台吗？',
    shortAnswer: '通过 React Native for Web 可以支持。',
    fullAnswer:
      'React Native for Web 提供了一套适配层，使 RN 组件能在浏览器中运行，实现一套代码多端（iOS、Android、Web）复用。',
  },
  {
    id: 'w9x0y1z2',
    question: '如何在 React Native 中使用本地存储？',
    shortAnswer: '可用 AsyncStorage 或 SQLite。',
    fullAnswer:
      'AsyncStorage 是简单的键值存储，适合小数据；对于复杂结构，可使用 SQLite 或第三方库如 WatermelonDB、Realm。',
  },
  {
    id: 'a3b4c5d6',
    question: 'React Native 中的组件生命周期有哪些？',
    shortAnswer: '包括挂载、更新、卸载三个阶段。',
    fullAnswer:
      '类组件有 componentDidMount、componentDidUpdate、componentWillUnmount；函数组件使用 useEffect 模拟这些生命周期。',
  },
  {
    id: 'e7f8g9h0',
    question: '如何在 React Native 中使用图片？',
    shortAnswer: '使用 Image 组件并设置 source 属性。',
    fullAnswer:
      '本地图片使用 require，网络图片使用 {uri: "url"}，并设置 width 和 height。支持 PNG、JPG、WebP 等格式。',
  },
  {
    id: 'i1j2k3l4',
    question: 'React Native 如何处理用户手势？',
    shortAnswer: '使用 PanResponder 或 Gesture Handler。',
    fullAnswer:
      'PanResponder 是 RN 内置的手势系统，较底层；推荐使用 react-native-gesture-handler，提供更强大、流畅的手势支持，如拖拽、缩放、长按等。',
  },
  {
    id: 'm5n6o7p8',
    question: 'React Native 如何实现动画？',
    shortAnswer: '使用 Animated API 或 Reanimated。',
    fullAnswer:
      'Animated 是 RN 内置动画系统，适合简单动画；reanimated 提供原生级性能，支持复杂交互式动画，推荐用于高性能场景。',
  },
  {
    id: 'q9r0s1t2',
    question: 'React Native 如何打包发布？',
    shortAnswer: 'iOS 用 Xcode 打包，Android 用 Gradle 构建。',
    fullAnswer:
      'iOS 需在 Xcode 中 Archive 并上传 App Store；Android 使用 ./gradlew assembleRelease 生成 APK/AAB，上传 Google Play。',
  },
  {
    id: 'u3v4w5x6',
    question: 'React Native 如何调试？',
    shortAnswer: '可用 Flipper、React DevTools、浏览器调试。',
    fullAnswer:
      'Flipper 提供设备日志、网络监控、UI 层级查看；React DevTools 查看组件树；Chrome/Safari 调试 JS 逻辑。',
  },
  {
    id: 'y7z8a9b0',
    question: 'React Native 如何支持深色模式？',
    shortAnswer: '通过 Appearance API 检测系统主题。',
    fullAnswer:
      '使用 Appearance.getColorScheme() 获取当前主题，结合 Context 或 Zustand 动态切换样式，实现亮色/暗色模式适配。',
  },
  {
    id: 'c1d2e3f4',
    question: 'React Native 中的 FlatList 有什么优势？',
    shortAnswer: '高效渲染长列表，支持懒加载和回收。',
    fullAnswer:
      'FlatList 只渲染可视区域内的项，支持 onEndReached、ItemSeparator、refreshControl，极大提升列表性能。',
  },
  {
    id: 'g5h6i7j8',
    question: 'React Native 如何实现推送通知？',
    shortAnswer: '使用 react-native-push-notification 或 Firebase。',
    fullAnswer:
      '集成 FCM（Firebase Cloud Messaging）或 APNs（Apple Push），通过原生模块接收通知，JS 层处理点击事件。',
  },
  {
    id: 'k9l0m1n2',
    question: 'React Native 如何访问设备相机？',
    shortAnswer: '使用 react-native-camera 或 expo-camera。',
    fullAnswer:
      '通过封装原生相机模块，JS 可调用拍照、录像、扫码等功能，需申请相机权限。',
  },
  {
    id: 'o3p4q5r6',
    question: 'React Native 如何获取地理位置？',
    shortAnswer: '使用 Geolocation API 或 react-native-geolocation-service。',
    fullAnswer:
      '调用 navigator.geolocation.getCurrentPosition 获取位置，需在 iOS 和 Android 配置权限和描述。',
  },
  {
    id: 's7t8u9v0',
    question: 'React Native 如何处理权限？',
    shortAnswer: '使用 react-native-permissions 请求系统权限。',
    fullAnswer:
      '该库统一管理 iOS 和 Android 的权限请求，如相机、位置、存储等，提供 request、check 等方法。',
  },
  {
    id: 'w1x2y3z4',
    question: 'React Native 如何支持国际化？',
    shortAnswer: '使用 i18n-js 或 react-i18next。',
    fullAnswer:
      '通过语言包文件（JSON）管理多语言文本，根据设备语言动态加载，支持 RTL（从右到左）布局。',
  },
  {
    id: 'a5b6c7d8',
    question: 'React Native 如何实现离线支持？',
    shortAnswer: '结合 AsyncStorage 和网络状态检测。',
    fullAnswer:
      '使用 NetInfo 检测网络状态，离线时读取本地缓存数据，上线后同步到服务器。',
  },
  {
    id: 'e9f0g1h2',
    question: 'React Native 如何进行单元测试？',
    shortAnswer: '使用 Jest 测试 JS 逻辑。',
    fullAnswer:
      'Jest 是默认测试框架，可测试组件逻辑、action、reducer。配合 React Testing Library 可进行组件渲染测试。',
  },
  {
    id: 'i3j4k5l6',
    question: 'React Native 如何实现主题切换？',
    shortAnswer: '使用 Context 或 Zustand 管理主题状态。',
    fullAnswer:
      '定义 light/dark 主题样式对象，通过 Provider 全局分发，组件使用 useContext 动态获取当前主题。',
  },
  {
    id: 'm7n8o9p0',
    question: 'React Native 如何支持 WebP 图片？',
    shortAnswer: 'Android 默认支持，iOS 需额外配置。',
    fullAnswer:
      'Android 从 4.0 开始支持 WebP；iOS 需要手动链接 libwebp 库或使用支持 WebP 的 Image 组件。',
  },
  {
    id: 'q1r2s3t4',
    question: 'React Native 如何实现语音识别？',
    shortAnswer: '使用 react-native-voice 或原生模块。',
    fullAnswer:
      '封装 iOS 的 SFSpeechRecognizer 和 Android 的 SpeechRecognizer，JS 层调用 start、stop 方法获取语音转文字结果。',
  },
  {
    id: 'u5v6w7x8',
    question: 'React Native 如何支持蓝牙？',
    shortAnswer: '使用 react-native-ble-plx 等库。',
    fullAnswer:
      '通过原生 BLE API 实现设备扫描、连接、读写特征值，适用于智能硬件通信场景。',
  },
  {
    id: 'y9z0a1b2',
    question: 'React Native 如何实现 PDF 预览？',
    shortAnswer: '使用 react-native-pdf 或 react-native-view-pdf。',
    fullAnswer:
      '加载本地或网络 PDF 文件，在 WebView 或原生 PDFView 中渲染，支持缩放、翻页。',
  },
  {
    id: 'c3d4e5f6',
    question: 'React Native 如何支持视频播放？',
    shortAnswer: '使用 react-native-video。',
    fullAnswer:
      '封装 AVPlayer（iOS）和 ExoPlayer（Android），支持本地和流媒体播放，可控制播放、暂停、全屏等。',
  },
  {
    id: 'g7h8i9j0',
    question: 'React Native 如何实现地图？',
    shortAnswer: '使用 react-native-maps。',
    fullAnswer:
      '封装 Google Maps（Android）和 Apple Maps（iOS），支持标记、路线、定位、自定义图层等。',
  },
  {
    id: 'k1l2m3n4',
    question: 'React Native 如何支持人脸识别？',
    shortAnswer: '调用原生 SDK 或使用 TensorFlow Lite。',
    fullAnswer:
      '通过桥接集成 FaceID（iOS）或 ML Kit（Android），或使用 TFLite 模型在设备端进行人脸检测与识别。',
  },
  {
    id: 'o5p6q7r8',
    question: 'React Native 如何实现支付？',
    shortAnswer: '集成 Stripe、Alipay 或微信支付 SDK。',
    fullAnswer:
      '通过原生模块调用支付接口，JS 层发起请求，监听支付结果回调，确保交易安全。',
  },
  {
    id: 's9t0u1v2',
    question: 'React Native 如何支持 AR？',
    shortAnswer: '使用 ViroReact 或原生 ARKit/ARCore。',
    fullAnswer:
      'ViroReact 提供跨平台 AR 开发能力，基于 ARKit（iOS）和 ARCore（Android），支持 3D 模型、手势交互等。',
  },
  {
    id: 'w3x4y5z6',
    question: 'React Native 如何实现后台任务？',
    shortAnswer: '使用 react-native-background-fetch 或 TaskManager。',
    fullAnswer:
      '在应用退到后台时执行轻量任务，如数据同步、位置更新，需遵守平台限制（如 iOS 后台执行时间）。',
  },
  {
    id: 'a7b8c9d0',
    question: 'React Native 如何支持无障碍访问？',
    shortAnswer: '使用 accessibilityProps 如 accessible、accessibilityLabel。',
    fullAnswer:
      '为组件设置可访问性属性，使 VoiceOver（iOS）和 TalkBack（Android）能正确读取内容，提升残障用户使用体验。',
  },
];
