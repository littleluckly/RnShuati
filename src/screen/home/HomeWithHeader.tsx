import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './HomeScreen';
import SearchableHeader from '../../navigation/SearchableHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 包装HomeScreen并添加自定义头部的组件
 * 专门处理头部与状态栏的间距问题
 */
const HomeWithHeader = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* 自定义头部 - 位于顶部安全区域内 */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <SearchableHeader />
      </View>
      
      {/* 主体内容区域 */}
      <View style={styles.contentContainer}>
        <HomeScreen />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    // 固定头部高度，确保内容不会被遮挡
    // 头部内容本身由SearchableHeader处理
  },
  contentContainer: {
    flex: 1,
    // 内容区域自动占据剩余空间
  },
});

export default HomeWithHeader;