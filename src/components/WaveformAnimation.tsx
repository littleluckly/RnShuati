import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';

interface WaveformAnimationProps {
  isPlaying: boolean;
  size?: number;
  color?: string;
  waveCount?: number;
}

const WaveformAnimation: React.FC<WaveformAnimationProps> = ({
  isPlaying,
  size = 48,
  color = '#4ECDC4',
  waveCount = 5,
}) => {
  const animatedValues = useRef(
    Array.from({length: waveCount}, () => new Animated.Value(0.3)),
  ).current;

  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [isPlaying]);

  const startAnimation = () => {
    const animations = animatedValues.map((animatedValue, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300 + index * 100,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0.3,
            duration: 300 + index * 100,
            useNativeDriver: false,
          }),
        ]),
      );
    });

    // 错开启动时间
    animations.forEach((animation, index) => {
      setTimeout(() => {
        animation.start();
      }, index * 100);
    });
  };

  const stopAnimation = () => {
    animatedValues.forEach(animatedValue => {
      animatedValue.stopAnimation();
      Animated.timing(animatedValue, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  };

  const waveHeight = size * 0.6;

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <View style={styles.waveContainer}>
        {animatedValues.map((animatedValue, index) => (
          <Animated.View
            key={index}
            style={[
              styles.wave,
              {
                backgroundColor: color,
                height: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [waveHeight * 0.3, waveHeight],
                }),
                opacity: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '70%',
    height: '70%',
  },
  wave: {
    width: 3,
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
});

export default WaveformAnimation;
