import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import {styles} from '../styles/styles';

interface BottomNavigationBarProps {
  navOpacity: SharedValue<number>;
  navTranslateYBottom: SharedValue<number>;
  handlePrev: () => void;
  handleNext: () => void;
  handleDirectory: () => void;
  handleSettings: () => void;
  currentIndex: number;
  totalQuestions: number;
  handlePlayPause: () => void;
  isPlaying: boolean;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  navOpacity,
  navTranslateYBottom,
  handlePrev,
  handleNext,
  handleDirectory,
  handleSettings,
  currentIndex,
  totalQuestions,
  handlePlayPause,
  isPlaying,
}) => {
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const insets = useSafeAreaInsets();

  // 创建动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: navOpacity.value,
      transform: [{translateY: navTranslateYBottom.value}],
      backgroundColor: navOpacity.value > 0 ? '#fff' : 'transparent',
      height: navOpacity.value > 0 ? 60 : 0,
    };
  });

  return (
    <>
      {/* PlayButton放在导航栏上方 */}
      <Animated.View
        style={[
          styles.playButtonContainer,
          animatedStyle,
          {
            bottom: 70 + insets.bottom,
          },
        ]}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <Text style={styles.playButtonText}>{isPlaying ? '停' : '听'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 底部导航栏 */}
      <Animated.View
        style={[
          styles.navBottom,
          animatedStyle,
          // {
          //   paddingBottom: insets.bottom,
          //   paddingLeft: insets.left,
          //   paddingRight: insets.right,
          // },
        ]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePrev}
          disabled={isFirstQuestion}>
          <View style={styles.navButtonContainer}>
            <Icon
              name="arrow-back"
              size={24}
              color={isFirstQuestion ? '#ccc' : '#000'}
            />
            <Text
              style={[
                styles.navButtonText,
                {color: isFirstQuestion ? '#ccc' : '#000'},
              ]}>
              上一题
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNext}
          disabled={isLastQuestion}>
          <View style={styles.navButtonContainer}>
            <Icon
              name="arrow-forward"
              size={24}
              color={isLastQuestion ? '#ccc' : '#000'}
            />
            <Text
              style={[
                styles.navButtonText,
                {color: isLastQuestion ? '#ccc' : '#000'},
              ]}>
              下一题
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleDirectory}>
          <View style={styles.navButtonContainer}>
            <Icon name="list" size={24} color="#000" />
            <Text style={[styles.navButtonText, {color: '#000'}]}>目录</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleSettings}>
          <View style={styles.navButtonContainer}>
            <Icon name="settings" size={24} color="#000" />
            <Text style={[styles.navButtonText, {color: '#000'}]}>设置</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};
