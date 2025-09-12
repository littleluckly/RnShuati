import React, {useCallback, memo, useEffect, useState} from 'react';
import {View, TouchableOpacity, Text, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, useAnimatedReaction, type SharedValue, runOnJS} from 'react-native-reanimated';
import {styles} from '../styles/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// 创建一个优化的目录项组件
const DirectoryItem = memo(
  ({
    item,
    index,
    currentQuestionId,
    handleDirectoryItemPress,
  }: {
    item: any;
    index: number;
    currentQuestionId: string;
    handleDirectoryItemPress: (questionId: string, index: number) => void;
  }) => {
    // 处理目录项点击
    const onPress = useCallback(() => {
      handleDirectoryItemPress(item._id, index);
    }, [item._id, index, handleDirectoryItemPress]);

    // 清理题目文本
    const cleanQuestionText = useCallback(() => {
      return item.question_markdown.replace(/[#*`]/g, '');
    }, [item.question_markdown]);

    return (
      <TouchableOpacity
        style={[
          styles.directoryItem,
          currentQuestionId === item._id && styles.directoryItemActive,
        ]}
        onPress={onPress}>
        <Text
          style={[
            styles.directoryItemText,
            currentQuestionId === item._id && styles.directoryItemTextActive,
          ]}
          numberOfLines={2}>
          {cleanQuestionText()}
        </Text>
        {currentQuestionId === item._id && (
          <Icon
            name="check"
            size={16}
            color="#1da1f2"
            style={styles.directoryItemCheck}
          />
        )}
      </TouchableOpacity>
    );
  },
);

interface DirectoryDrawerProps {
  showDirectory: boolean;
  directoryTranslateX: SharedValue<number>;
  overlayOpacity: SharedValue<number>;
  animateDirectory: (show: boolean) => void;
  questions: any[];
  currentQuestionId: string;
  handleDirectoryItemPress: (questionId: string, index: number) => void;
  directoryFlatListRef: React.RefObject<FlatList>;
  handleDirectoryEndReached: () => void;
  renderDirectoryFooter: () => {loading: boolean} | null;
}

export const DirectoryDrawer: React.FC<DirectoryDrawerProps> = ({
  showDirectory,
  directoryTranslateX,
  overlayOpacity,
  animateDirectory,
  questions,
  currentQuestionId,
  handleDirectoryItemPress,
  directoryFlatListRef,
  handleDirectoryEndReached,
  renderDirectoryFooter,
}) => {
  const insets = useSafeAreaInsets();
  const contentOpacity = useSharedValue(showDirectory ? 1 : 0);
  const isRendered = useSharedValue(showDirectory ? 1 : 0);
  const [isVisible, setIsVisible] = useState(showDirectory);

  // 同步内容区域的透明度动画
  useEffect(() => {
    contentOpacity.value = withTiming(showDirectory ? 1 : 0, {duration: 200});
    isRendered.value = withTiming(showDirectory ? 1 : 0, {duration: 200});
  }, [showDirectory, contentOpacity, isRendered]);

  // 使用useAnimatedReaction监听isRendered的变化，更新React状态
  useAnimatedReaction(
    () => isRendered.value,
    (currentValue) => {
      if (showDirectory) {
        // 当显示目录时，始终设置为可见
        runOnJS(setIsVisible)(true);
      } else if (currentValue === 0) {
        // 当目录完全隐藏后，设置为不可见
        runOnJS(setIsVisible)(false);
      }
    },
    [showDirectory]
  );
  // 渲染目录项
  const renderDirectoryItem = useCallback(
    ({item, index}: {item: any; index: number}) => (
      <DirectoryItem
        item={item}
        index={index}
        currentQuestionId={currentQuestionId}
        handleDirectoryItemPress={handleDirectoryItemPress}
      />
    ),
    [currentQuestionId, handleDirectoryItemPress],
  );

  // 优化列表项的key提取
  const keyExtractor = useCallback((item: any) => item._id, []);

  // 创建动画样式
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: directoryTranslateX.value}],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  // 如果组件不可见，不渲染任何内容
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Animated.View
        style={[
          styles.directoryContainer,
          containerStyle,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom
          }
        ]}>
        <View style={styles.directoryHeader}>
          <Text style={styles.directoryTitle}>题目目录</Text>
          <TouchableOpacity
            style={styles.directoryCloseButton}
            onPress={() => animateDirectory(false)}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Animated.View style={[contentStyle, {flex: 1}]}>
          <FlatList
            ref={directoryFlatListRef}
            data={questions}
            renderItem={renderDirectoryItem}
            keyExtractor={keyExtractor}
            style={styles.directoryList}
            showsVerticalScrollIndicator={true}
            onEndReached={handleDirectoryEndReached}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() => {
              const footer = renderDirectoryFooter();
              if (footer && footer.loading) {
                return (
                  <View style={styles.directoryLoadingFooter}>
                    <Text style={styles.directoryLoadingText}>加载中...</Text>
                  </View>
                );
              }
              return null;
            }}
            // 添加性能优化属性
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            updateCellsBatchingPeriod={50}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity
          style={{flex: 1}}
          activeOpacity={1}
          onPress={() => animateDirectory(false)}
        />
      </Animated.View>
    </>
  );
};
