import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {useAnimatedStyle, SharedValue} from 'react-native-reanimated';
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
}) => {
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  
  // 创建动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: navOpacity.value,
      transform: [{translateY: navTranslateYBottom.value}],
    };
  });

  return (
    <Animated.View
      style={[
        styles.navBottom,
        animatedStyle,
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
  );
};
