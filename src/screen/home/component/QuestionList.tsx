import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {FlatList} from 'react-native';
import SwipeableItem from './SwipeableItem';

import metadata from '@/data/importQuestion';
import {QuestionMeta} from '@/models/QuestionMeta';

export default () => {
  const data = useMemo(
    () => metadata.map(item => new QuestionMeta(item)),
    [metadata],
  );

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

    // 注意：不在这里重置状态，而是在页面返回时重置
    // 或者通过navigation listener来处理状态重置
  }, []);

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={i => i.id}
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
