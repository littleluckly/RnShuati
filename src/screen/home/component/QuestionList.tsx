import React, {useEffect, useMemo, useRef} from 'react';
import {FlatList, Platform} from 'react-native';
import SwipeableItem from './SwipeableItem';
import Sound from 'react-native-sound';
import Markdown from 'react-native-markdown-display';

import metadata from '@/data/importQuestion';
import {QuestionMeta} from '@/models/QuestionMeta';

export default () => {
  const data = useMemo(
    () => metadata.map(item => new QuestionMeta(item)),
    [metadata],
  );

  const refs = useRef(new Map<string, any>()).current;
  const onWillOpen = (openingId: string) => {
    refs.forEach((ref, id) => {
      if (id !== openingId && ref) ref.close(); // 立即关
    });
  };

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={i => i.id}
        renderItem={({item, index}) => (
          <SwipeableItem
            metadata={item}
            onWillOpen={onWillOpen}
            setRef={r => refs.set(item.id, r)}
            index={index}
          />
        )}
      />
    </>
  );
};
