import {
  useNavigation,
  useRoute,
  useNavigationState,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {RootNavigation} from './Types';
import {useHeaderHeight} from '@react-navigation/elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Platform, StatusBar} from 'react-native';
import GlobalStyles from '@/styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const SearchableHeader = () => {
  const navigation = useNavigation<RootNavigation>();
  const canGoBack = navigation.canGoBack();
  const headerHeight = useHeaderHeight();

  // 默认 header 高度和样式（跨平台）
  const getDefaultHeaderStyle = useCallback(() => {
    const isIos = Platform.OS === 'ios';
    const finalHeight = Math.max(headerHeight || 56, 56); // 确保最小高度
    return {
      height: finalHeight, // 自动适配实际 header 高度（含状态栏）
      minHeight: 56, // 确保最小高度
      backgroundColor: 'white',
      borderBottomWidth: isIos ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: '#C8C7CC',
      elevation: isIos ? 0 : 4, // Android 加阴影
      shadowColor: isIos ? '#000' : undefined,
      shadowOffset: isIos ? {width: 0, height: 0.5} : undefined,
      shadowOpacity: isIos ? 0.3 : undefined,
      shadowRadius: isIos ? 1 : undefined,
    };
  }, [headerHeight]); // 修复依赖数组

  const progress = useSharedValue(0);
  const [headerVisible, setHeaderVisible] = useState(false); // 🔑 控制头部是否显示

  // ✅ 使用 useEffect 而不是 setTimeout 来触发动画
  useEffect(() => {
    console.log('🚀 SearchableHeader 初始化，准备开始动画...');
    // 确保组件挂载后延迟开始动画
    const timer = setTimeout(() => {
      console.log('🎨 开始头部渐显动画');
      setHeaderVisible(true); // 🔑 先显示头部
      progress.value = withSpring(1, {
        damping: 20,
        stiffness: 200,
      });
    }, 1000); // 延迟 1 秒开始动画

    return () => {
      console.log('🗑️ 清理动画定时器');
      clearTimeout(timer);
    };
  }, []);

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value, // 直接使用 progress.value
      transform: [
        {
          // ✅ 修复动画计算：从 -20px 滑入到 0px
          translateY: (1 - progress.value) * -20,
        },
      ],
    };
  });

  const insets = useSafeAreaInsets(); // 获取安全区域
  const route = useRoute();
  const navigationState = useNavigationState(state => state);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');

  // 获取当前路由的标题 - 根据route.name显示中文标题
  const getChineseTitle = () => {
    switch (route.name) {
      case 'DetailScreen':
        return '题目详情';
      case 'HomeScreen':
        return '首页';
      case 'WelcomeScreen':
        return '欢迎';
      case 'ProfileScreen':
        return '个人资料';
      default:
        return route.name;
    }
  };

  const title = getChineseTitle();

  const style = {
    paddingTop:
      insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight : 0),
    paddingLeft: insets.left + 8,
    paddingRight: insets.right + 8,
    height: headerHeight, // 包含状态栏 + header 高度
  };

  const onSubmit = () => {
    console.log('搜索内容:', query);
    // 执行搜索逻辑
    setIsSearching(false);
    setQuery('');
    // 可选：跳转到搜索结果页
    // navigation.navigate('SearchResults', { query });
  };

  const onCancel = () => {
    setIsSearching(false);
    setQuery('');
  };

  // // 🔑 只有在 headerVisible 为 true 时才渲染头部
  // if (!headerVisible && !isSearching) {
  //   return null; // 返回 null 以完全隐藏头部
  // }

  // 动态渲染 header
  if (isSearching) {
    return (
      <View
        style={[
          styles.searchHeader,
          headerStyle, // ✅ 也为搜索模式添加动画
          isSearching && {padding: 0},
          getDefaultHeaderStyle(),
        ]}>
        <TextInput
          style={[styles.searchInput]}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSubmit}
          autoFocus
          placeholder="标题，内容等关键字"
          returnKeyType="search"
          blurOnSubmit={false}
        />
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.defaultHeader,
        headerStyle,
        getDefaultHeaderStyle(),
        {zIndex: 9999},
      ]}>
      {/* 左侧：返回按钮（仅在可以返回时显示） */}
      {canGoBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={20} color="#333"></Ionicons>
        </TouchableOpacity>
      ) : (
        <View style={{width: 60}} /> // 占位，保持对齐
      )}
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={() => setIsSearching(true)}>
        <Ionicons name="search" size={20} color="gray" />
      </TouchableOpacity>

      {/* 右侧：其他按钮，如菜单 */}
      {/* <TouchableOpacity>
        <Ionicons name="ellipsis-vertical-sharp" size={20} color="gray" />
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  defaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 56, // 确保最小高度
    height: 56,
    overflow: 'hidden',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 56,
    overflow: 'hidden',
    // ...getDefaultHeaderStyle(), // ✅ 应用统一背景、阴影、高度
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: 'black',
  },
  searchIcon: {
    fontSize: 24,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: 'black',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF', // iOS 风格蓝色
    fontWeight: '500',
  },
});

export default SearchableHeader;
