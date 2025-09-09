import React from 'react';
import {View, TouchableOpacity, Text, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {styles} from '../styles/styles';

interface TopNavigationBarProps {
  navOpacity: Animated.Value;
  navTranslateYTop: Animated.Value;
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
  return (
    <Animated.View
      style={[
        styles.navTop,
        {opacity: navOpacity, transform: [{translateY: navTranslateYTop}]},
      ]}>
      <TouchableOpacity style={styles.navBackButton} onPress={handleBack}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.navTitle} numberOfLines={1}>
        {currentIndex + 1}/{total}
      </Text>
      <View style={styles.navSpacer} />
    </Animated.View>
  );
};
