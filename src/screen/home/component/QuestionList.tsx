import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, ActivityIndicator, View, StyleSheet} from 'react-native';
import SwipeableItem from './SwipeableItem';

import {questionApiService} from '@/services';

interface Props {
  subjectId: string;
  filters?: {difficulty?: string; tags?: string[]};
}

export default ({subjectId, filters = {}}: Props) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const prevFilters = useRef(filters);

  // 监听筛选条件变化
  useEffect(() => {
    if (JSON.stringify(prevFilters.current) !== JSON.stringify(filters)) {
      prevFilters.current = filters;
      // 重置分页状态并重新获取数据
      setPage(1);
      setHasMore(true);
      fetchData(false, 1);
    }
  }, [filters]);

  const fetchData = async (isRefreshing = false, nextPage = 1) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await questionApiService.getFilteredQuestionList({
        subjectId: subjectId,
        limit: 10,
        page: nextPage,
        ...filters,
      });
      // const ids = response.data?.questions.map(item => item.id);
      // console.log(ids?.length === [...new Set(ids)].length, '相等吗');

      if (response.success && response.data && response.data.questions) {
        console.log('api获取完毕');
        if (isRefreshing || nextPage === 1) {
          setData(response.data.questions);
        } else {
          // 使用Set优化过滤已经存在的项，避免key重复
          const existingIds = new Set(data.map(item => item._id));
          const newQuestions = response.data.questions.filter(
            newQuestion => !existingIds.has(newQuestion._id),
          );
          setData(prevData => [...prevData, ...newQuestions]);
        }

        // 检查是否还有更多数据
        setHasMore(
          (response.data &&
            response.data.pagination &&
            response.data.pagination.hasNext) ||
            false,
        );
        setPage(nextPage);
      }
    } catch (error) {
      console.error('获取题目列表失败:', error);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    fetchData(true, 1);
  };

  const onEndReached = () => {
    // 防止在数据加载完成前重复触发
    if (!loading && !refreshing && hasMore) {
      fetchData(false, page + 1);
    }
  };

  useEffect(() => {
    fetchData(false, 1);
  }, [subjectId]);

  // 列表项引用管理
  const refs = useRef(new Map<string, any>()).current;

  // 被选中的列表项状态
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // 当页面重新获得焦点时重置选中状态
  useFocusEffect(
    useCallback(() => {
      // 页面获得焦点时重置状态，确保从详情页返回时列表恢复正常
      setSelectedItemId(null);
    }, []),
  );

  // 处理滑动打开事件
  const onWillOpen = (openingId: string) => {
    refs.forEach((ref, id) => {
      if (id !== openingId && ref) ref.close(); // 立即关闭其他项
    });
  };

  // 处理列表项点击事件
  const onItemPress = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
  }, []);

  if (loading && data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 使用 React.memo 优化 renderItem 组件
  const MemoizedSwipeableItem = React.memo(
    ({item, index}: {item: any; index: number}) => (
      <SwipeableItem
        metadata={item}
        onWillOpen={onWillOpen}
        setRef={(r: any) => refs.set(item._id, r)}
        index={index}
        selectedItemId={selectedItemId}
        onItemPress={onItemPress}
      />
    ),
  );

  // 渲染列表底部加载指示器
  const renderFooter = () => {
    if (!loading || data.length === 0) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={item => item._id}
        renderItem={({item, index}) => (
          <MemoizedSwipeableItem item={item} index={index} />
        )}
        ListFooterComponent={renderFooter}
        // 下拉刷新相关属性
        refreshing={refreshing}
        onRefresh={onRefresh}
        // 上拉加载相关属性
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        // 性能优化相关属性
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    padding: 10,
    alignItems: 'center',
  },
});
