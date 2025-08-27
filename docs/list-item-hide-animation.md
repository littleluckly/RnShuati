# 列表项隐藏动画功能实现说明

## 功能概述

实现了一个平滑的列表项交互动画效果：当用户点击某个列表项时，其他所有列表项会逐渐隐藏（淡出、缩放、上移），突出被选中的项目，提供更好的视觉焦点和用户体验。

## 核心技术

- **React Native Reanimated 3.16.0**: 用于高性能的原生动画
- **React Hooks**: 状态管理和组件生命周期
- **TypeScript**: 类型安全和代码质量保证

## 实现原理

### 1. 状态管理

```typescript
// 在 QuestionList.tsx 中管理全局选中状态
const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
```

### 2. 动画值初始化

```typescript
// 在 SwipeableItem.tsx 中为每个列表项创建动画值
const opacity = useSharedValue(1); // 透明度
const scale = useSharedValue(1); // 缩放
const translateY = useSharedValue(0); // 垂直位移
```

### 3. 条件判断

```typescript
// 判断当前项是否应该隐藏
const shouldHide = selectedItemId && selectedItemId !== id;
```

### 4. 动画执行

```typescript
useEffect(() => {
  if (shouldHide) {
    // 隐藏动画：透明度降低、缩放、上移
    opacity.value = withTiming(0.3, {duration: 250});
    scale.value = withTiming(0.95, {duration: 250});
    translateY.value = withTiming(-10, {duration: 250});
  } else {
    // 显示动画：恢复原状
    opacity.value = withSpring(1, {damping: 20, stiffness: 300});
    scale.value = withSpring(1, {damping: 20, stiffness: 300});
    translateY.value = withSpring(0, {damping: 20, stiffness: 300});
  }
}, [shouldHide]);
```

### 5. 样式应用

```typescript
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [{scale: scale.value}, {translateY: translateY.value}],
}));
```

## 动画细节

### 隐藏动画参数

- **透明度**: 1.0 → 0.3 (保持部分可见度)
- **缩放**: 1.0 → 0.95 (轻微缩小)
- **位移**: 0 → -10px (向上移动)
- **持续时间**: 250ms
- **缓动**: withTiming (线性过渡)

### 恢复动画参数

- **透明度**: 当前值 → 1.0 (完全不透明)
- **缩放**: 当前值 → 1.0 (原始大小)
- **位移**: 当前值 → 0 (原始位置)
- **缓动**: withSpring (弹性效果)
- **弹性参数**: damping: 20, stiffness: 300

## 用户交互流程

1. **用户点击列表项**

   - 触发 `onItemPress(itemId)` 回调
   - 设置 `selectedItemId` 状态

2. **动画触发**

   - 其他列表项检测到 `shouldHide = true`
   - 执行隐藏动画 (250ms)

3. **导航延迟**

   - 延迟 100ms 后开始页面导航（减少延迟避免闪烁）
   - 给动画足够时间展示效果

4. **状态重置**
   - 使用 `useFocusEffect` 监听页面焦点变化
   - 当从详情页返回时自动重置状态
   - 避免在导航期间的状态重置造成视觉闪烁

## 状态管理优化

### 问题解决

之前的实现中，状态重置使用 `setTimeout(300ms)` 可能在页面跳转前触发，导致用户看到列表项重新展示的闪烁效果。

### 解决方案

```typescript
// 在 QuestionList.tsx 中使用 useFocusEffect
useFocusEffect(
  useCallback(() => {
    // 页面获得焦点时重置状态，确保从详情页返回时列表恢复正常
    setSelectedItemId(null);
  }, []),
);

// 在 onItemPress 中不再使用 setTimeout 重置状态
const onItemPress = useCallback((itemId: string) => {
  setSelectedItemId(itemId);
  // 状态重置交给 useFocusEffect 处理
}, []);
```

### 时机协调

- **导航延迟**: 100ms（足够展示动画效果）
- **动画持续**: 250ms（隐藏动画）
- **状态重置**: 页面焦点变化时（避免闪烁）

## 性能优化

### 1. 内存优化

- 使用 `React.memo` 防止不必要的重新渲染
- 自定义比较函数检查关键 prop 变化

```typescript
React.memo(SwipeableItem, (prevProps: Props, nextProps: Props) => {
  return (
    prevProps.metadata.id === nextProps.metadata.id &&
    prevProps.index === nextProps.index &&
    prevProps.selectedItemId === nextProps.selectedItemId
  );
});
```

### 2. 动画优化

- 使用 `useAnimatedStyle` 确保动画在 UI 线程执行
- 避免 JavaScript 线程阻塞
- 使用原生驱动的动画值

### 3. 事件优化

- 使用 `useCallback` 缓存事件处理函数
- 防止子组件不必要的重新渲染

## 视觉设计考虑

### 1. 非破坏性隐藏

- 不完全隐藏 (opacity: 0.3)，保持用户对列表结构的感知
- 轻微缩放而非大幅度变化，保持界面稳定感

### 2. 自然的动画曲线

- 隐藏使用线性动画 (快速响应)
- 恢复使用弹性动画 (自然感受)

### 3. 合适的时间节奏

- 250ms 隐藏动画：足够明显但不拖沓
- 150ms 导航延迟：平衡动画效果和响应速度

## 扩展可能性

### 1. 动画变体

- 可以调整透明度、缩放比例、位移距离
- 支持不同的缓动函数
- 可配置动画持续时间

### 2. 交互模式

- 支持长按触发动画
- 支持多选模式的动画
- 支持手势驱动的动画

### 3. 视觉效果

- 添加模糊效果
- 支持颜色变化
- 添加粒子效果或阴影变化

## 使用示例

```typescript
// 在你的列表组件中使用
<FlatList
  data={data}
  renderItem={({item, index}) => (
    <SwipeableItem
      metadata={item}
      selectedItemId={selectedItemId}
      onItemPress={onItemPress}
      // ... 其他props
    />
  )}
/>
```

这个实现提供了流畅、自然的用户体验，同时保持了良好的性能表现和代码可维护性。
