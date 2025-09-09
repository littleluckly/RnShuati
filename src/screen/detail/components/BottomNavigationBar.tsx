import React from 'react';
import {View, TouchableOpacity, Text, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {styles} from '../styles/styles';

interface BottomNavigationBarProps {
  navOpacity: Animated.Value;
  navTranslateYBottom: Animated.Value;
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

  return (
    <Animated.View
      style={[
        styles.navBottom,
        {opacity: navOpacity, transform: [{translateY: navTranslateYBottom}]},
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
