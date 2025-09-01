import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList} from 'react-native';
import SwipeableItem from './SwipeableItem';

import {questionApiService} from '@/services';

interface Props {
  subjectId: string;
  filters?: {difficulty?: string; tags?: string[]};
}

export default ({subjectId, filters = {}}: Props) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const prevFilters = useRef(filters);

  // 监听筛选条件变化
  useEffect(() => {
    if (JSON.stringify(prevFilters.current) !== JSON.stringify(filters)) {
      prevFilters.current = filters;
      fetchData();
    }
  }, [filters]);

  const fetchData = async () => {
    try {
      const response = await questionApiService.getFilteredQuestionList({
        subjectId: subjectId,
        limit: 10,
        ...filters,
      });
      // console.log('response.data', response.data);
      if (response.success && response.data) {
        setData(response.data.questions);
      }
    } catch (error) {
      console.error('获取题目列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  if (loading) {
    return null; // 或者返回一个加载指示器
  }

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <SwipeableItem
            metadata={item}
            onWillOpen={onWillOpen}
            setRef={(r: any) => refs.set(item.id, r)}
            index={index}
            selectedItemId={selectedItemId}
            onItemPress={onItemPress}
          />
        )}
      />
    </>
  );
};
