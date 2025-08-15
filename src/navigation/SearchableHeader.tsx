import {useNavigation, useRoute} from '@react-navigation/native';
import {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {RootTabNavigation} from './Types';
import {useHeaderHeight} from '@react-navigation/elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Platform, StatusBar} from 'react-native';
import GlobalStyles from '@/styles/globalStyles';

const SearchableHeader = () => {
  // 默认 header 高度和样式（跨平台）
  const getDefaultHeaderStyle = () => {
    const isIos = Platform.OS === 'ios';
    return {
      height: useHeaderHeight(), // 自动适配实际 header 高度（含状态栏）
      backgroundColor: 'white',
      borderBottomWidth: isIos ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: '#C8C7CC',
      elevation: isIos ? 0 : 4, // Android 加阴影
      shadowColor: isIos ? '#000' : undefined,
      shadowOffset: isIos ? {width: 0, height: 0.5} : undefined,
      shadowOpacity: isIos ? 0.3 : undefined,
      shadowRadius: isIos ? 1 : undefined,
    };
  };
  const insets = useSafeAreaInsets(); // 获取安全区域
  const navigation = useNavigation<RootTabNavigation>();
  const route = useRoute();
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');

  const style = {
    paddingTop:
      insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight : 0),
    paddingLeft: insets.left + 8,
    paddingRight: insets.right + 8,
    height: useHeaderHeight(), // 包含状态栏 + header 高度
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

  // 动态渲染 header
  if (isSearching) {
    return (
      <View
        style={[
          styles.searchHeader,
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
    <View style={[styles.defaultHeader, getDefaultHeaderStyle()]}>
      <Text style={styles.title}>{route.name}</Text>
      <TouchableOpacity onPress={() => setIsSearching(true)}>
        {/* 可替换为图标，如: <Ionicons name="search" size={24} color="black" /> */}
        <Text style={styles.searchIcon}>🔍</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  defaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    overflow: 'hidden',

    // ...getDefaultHeaderStyle(),
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
