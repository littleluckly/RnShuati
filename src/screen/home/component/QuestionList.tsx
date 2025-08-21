import React, {useEffect, useRef} from 'react';
import {FlatList, Platform} from 'react-native';
import SwipeableItem from './SwipeableItem';
import Sound from 'react-native-sound';

const data = Array.from({length: 20}, (_, i) => ({
  id: String(i + 1),
  title: `Selection Tool ${
    i + 1
  } asdf老师的会计法爱尔兰人；感觉饿啊；乐观额啊我；令人感觉；俄里翁人口结构`,
  subtitle: `${i + 1} Menit 10 Detik`,
}));

export default () => {
  // 声明音频实例
  let beepSound: Sound | null = null;

  useEffect(() => {
    // 使用 Android res/raw 中的资源名（不带扩展名）
    const filename =
      Platform.OS === 'android' ? 'audio_analysis' : 'audio_analysis.mp3';
    const sound = new Sound(filename, Sound.MAIN_BUNDLE, err => {
      if (err) {
        console.log('Failed to load the sound', err);
        return;
      }
      sound.play(() => sound.release());
      console.log('Sound played');
    });
  }, []);

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
