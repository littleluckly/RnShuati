import React from 'react';
import {FlatList} from 'react-native';
import SwipeableItem from './SwipeableItem';

const data = Array.from({length: 20}, (_, i) => ({
  id: String(i + 1),
  title: `Selection Tool ${i + 1}`,
  subtitle: `${i + 1} Menit 10 Detik`,
}));

export default () => (
  <FlatList
    data={data}
    keyExtractor={item => item.id}
    renderItem={({item}) => <SwipeableItem {...item} />}
  />
);
