import React, {useRef} from 'react';
import {FlatList} from 'react-native';
import SwipeableItem from './SwipeableItem';

const data = Array.from({length: 20}, (_, i) => ({
  id: String(i + 1),
  title: `Selection Tool ${i + 1}`,
  subtitle: `${i + 1} Menit 10 Detik`,
}));

export default () => {
  const refs = useRef(new Map<string, any>()).current;
  const onWillOpen = (openingId: string) => {
    refs.forEach((ref, id) => {
      if (id !== openingId && ref) ref.close(); // 立即关
    });
  };

  return (
    <FlatList
      data={data}
      keyExtractor={i => i.id}
      renderItem={({item}) => (
        <SwipeableItem
          {...item}
          onWillOpen={onWillOpen}
          setRef={r => refs.set(item.id, r)}
        />
      )}
    />
  );
};
