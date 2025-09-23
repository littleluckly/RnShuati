import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useHeaderHeight} from '@react-navigation/elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {RootNavigation} from './Types';
import {useQuestionContext} from '../contexts/QuestionContext';

const SearchableHeader = () => {
  const navigation = useNavigation<RootNavigation>();
  const canGoBack = navigation.canGoBack();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets(); // 获取安全区域

  const route = useRoute();
  const {updateFilters} = useQuestionContext() || {};
  // 类型断言，确保route.params可以访问subjectName属性
  const params = route.params as {subjectName?: string} | undefined;
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');

  // 获取当前路由的标题 - 根据route.name显示中文标题，对于HomeScreen可以显示动态科目名称和题目总数
  const getChineseTitle = () => {
    switch (route.name) {
      case 'DetailScreen':
        return '题目详情';
      case 'HomeScreen':
        return params?.subjectName;
      case 'ProfileScreen':
        return '个人资料';
      default:
        return route.name;
    }
  };

  const title = getChineseTitle();

  // 计算标题容器的样式，根据是否有返回按钮调整对齐方式
  const getTitleContainerStyle = () => {
    return {
      flex: 1,
      alignItems: canGoBack ? ('flex-start' as const) : ('center' as const),
      justifyContent: 'center' as const,
    };
  };

  const onSubmit = () => {
    console.log('搜索内容:', query);
    // 执行搜索逻辑
    setIsSearching(false);
    // setQuery('');

    // 直接通过QuestionContext更新搜索条件，触发列表搜索
    if (updateFilters) {
      updateFilters({searchKeyword: query || undefined});
    }
  };

  const onCancel = () => {
    setIsSearching(false);
    setQuery('');

    updateFilters({searchKeyword: ''});
  };

  // 动态渲染 header
  if (isSearching) {
    return (
      <View style={[styles.headerContainer, styles.searchHeader]}>
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
    <View style={[styles.headerContainer, styles.defaultHeader]}>
      {/* 左侧：返回按钮（仅在可以返回时显示） */}
      {canGoBack && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={20} color="#333"></Ionicons>
        </TouchableOpacity>
      )}
      <View style={getTitleContainerStyle()}>
        <Text style={styles.title} numberOfLines={1}>
          {title || '题库'}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setIsSearching(true)}
        style={styles.searchButton}>
        <Ionicons name="search" size={20} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // 基础头部容器样式，包含安全区域适配
  headerContainer: {
    paddingTop: 0, // 通过 useSafeAreaInsets 已经在更高层级处理了
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C8C7CC',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 0.5},
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 0,
      },
      android: {
        elevation: 4,
      },
    }),
    zIndex: 9999,
  },

  // 默认头部样式
  defaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    overflow: 'hidden',
  },

  // 搜索头部样式
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 56,
    overflow: 'hidden',
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
  },

  // 按钮样式
  backButton: {
    padding: 8,
    marginLeft: -8, // 抵消部分 paddingHorizontal
  },

  searchButton: {
    padding: 8,
    marginRight: -8, // 抵消部分 paddingHorizontal
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
    height: '100%',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 17,
    color: '#007AFF', // iOS 风格蓝色
    fontWeight: '500',
  },
});

export default SearchableHeader;
