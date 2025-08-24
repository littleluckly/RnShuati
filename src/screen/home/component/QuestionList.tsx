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
  // 声明音频实例
  // let beepSound: Sound;

  // useEffect(() => {
  //   // 使用 Android res/raw 中的资源名（不带扩展名）
  //   const filename =
  //     Platform.OS === 'android' ? 'audio_question' : 'audio_question.mp3';
  //   beepSound = new Sound(filename, Sound.MAIN_BUNDLE, err => {
  //     if (err) {
  //       console.log('Failed to load the sound', err);
  //       return;
  //     }
  //     beepSound.play(() => beepSound.release());
  //     console.log('Sound played');
  //   });
  //   // 组件销毁时调用
  //   return () => {
  //     beepSound.release();
  //   };
  // }, []);

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
