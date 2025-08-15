// HighlightKeyword.tsx
import React from 'react';
import {StyleSheet, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  keyword: string;
  fontSize?: number;
}

const AnimatedLG = Animated.createAnimatedComponent(LinearGradient);

export default function HighlightKeyword({keyword, fontSize = 42}: Props) {
  const scale = useSharedValue(1);
  scale.value = withRepeat(
    withTiming(1.08, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
    -1,
    true,
  );
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <AnimatedLG
      colors={['#ff00ff', '#00ffff']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={[animatedStyle, {borderRadius: 4}]}>
      <Text style={[styles.text, {fontSize}]}>{keyword}</Text>
    </AnimatedLG>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 4,
    paddingVertical: 2,
    textShadowColor: 'rgba(0,255,255,0.8)',
    textShadowRadius: 8,
    textShadowOffset: {width: 0, height: 2},
  },
});
