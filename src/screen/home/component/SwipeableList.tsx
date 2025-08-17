import React from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import {SwipeRow} from './QuizListItem';

const DATA = Array.from({length: 30}, (_, i) => ({
  id: `${i}`,
  title: `商品 ${i + 1}`,
}));

export const SwipeableList = () => {
  const activeId = useSharedValue<string | null>(null);

  return (
    <FlatList
      data={DATA}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <SwipeRow
          id={item.id}
          title={item.title}
          activeId={activeId} // 所有行共享
        />
      )}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {paddingVertical: 12},
});
