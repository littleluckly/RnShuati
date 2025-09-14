import React from 'react';
import {View, TouchableOpacity, Text, SafeAreaView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {useAnimatedStyle, SharedValue} from 'react-native-reanimated';
import {styles} from '../styles/styles';

interface TopNavigationBarProps {
  navOpacity: SharedValue<number>;
  navTranslateYTop: SharedValue<number>;
  handleBack: () => void;
  currentIndex: number;
  total: number;
}

export const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  navOpacity,
  navTranslateYTop,
  handleBack,
  currentIndex,
  total,
}) => {
  // 创建动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: navOpacity.value,
      transform: [{translateY: navTranslateYTop.value}],
    };
  });

  return (
    <SafeAreaView style={{backgroundColor: '#fff'}}>
      <Animated.View
        style={[
          styles.navTop,
          animatedStyle,
        ]}>
        <TouchableOpacity style={styles.navBackButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {currentIndex + 1}/{total}
        </Text>
        <View style={styles.navSpacer} />
      </Animated.View>
    </SafeAreaView>
  );
};
