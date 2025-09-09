import React, {useCallback, memo} from 'react';
import {View, TouchableOpacity, Text, Animated, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {styles} from '../styles/styles';

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
  directoryTranslateX: Animated.Value;
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
  animateDirectory,
  questions,
  currentQuestionId,
  handleDirectoryItemPress,
  directoryFlatListRef,
  handleDirectoryEndReached,
  renderDirectoryFooter,
}) => {
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

  if (!showDirectory) {
    return null;
  }

  return (
    <>
      <Animated.View
        style={[
          styles.directoryContainer,
          {transform: [{translateX: directoryTranslateX}]},
        ]}>
        <View style={styles.directoryHeader}>
          <Text style={styles.directoryTitle}>题目目录</Text>
          <TouchableOpacity
            style={styles.directoryCloseButton}
            onPress={() => animateDirectory(false)}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => animateDirectory(false)}
      />
    </>
  );
};
