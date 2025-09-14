import React from 'react';
import {View, TouchableOpacity, Text, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import {styles} from '../styles/styles';

interface TopNavigationBarProps {
  navOpacity: SharedValue<number>;
  navTranslateYTop: SharedValue<number>;
  handleBack: () => void;
  currentIndex: number;
  total: number;
  title?: string;
}

export const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  navOpacity,
  navTranslateYTop,
  handleBack,
  currentIndex,
  total,
}) => {
  const insets = useSafeAreaInsets();
  // 创建动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: navOpacity.value,
      transform: [{translateY: navTranslateYTop.value}],
      backgroundColor: navOpacity.value > 0 ? '#fff' : 'transparent',
      height: navOpacity.value > 0 ? 60 : 0,
    };
  });

  // 为iOS添加特殊样式，增强导航栏可见性
  const platformSpecificStyles =
    Platform.OS === 'ios'
      ? {
          // 增加阴影效果以区分导航栏和内容区
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 3,
          // 确保在iOS上有更高的zIndex
          zIndex: 1000,
          // 在iOS上增加底部边框，增强视觉区分
          borderBottomWidth: 1,
          borderBottomColor: '#e0e0e0',
          // 确保内容在iOS上更清晰可见
          backgroundColor: '#f9f9f9', // 略微不同于纯白的背景色
        }
      : {};

  return (
    <View style={[styles.navTop, animatedStyle, platformSpecificStyles]}>
      <TouchableOpacity style={styles.navBackButton} onPress={handleBack}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.navTitle} numberOfLines={1}>
        {currentIndex + 1}/{total}
      </Text>
      <View style={styles.navSpacer} />
    </View>
  );
};
