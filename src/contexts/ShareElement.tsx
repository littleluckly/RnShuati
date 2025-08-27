import {View, Text, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import Animated, {AnimatedStyle} from 'react-native-reanimated';

export const SharedElement = ({
  style,
  question,
  sourceLayout,
}: {
  style: AnimatedStyle;
  question: string;
  sourceLayout?: {x: number; y: number; height: number; width: number};
}) => (
  <Animated.View
    style={[
      styles.container,
      style,
      sourceLayout && {
        top: sourceLayout.y - 59,
        height: sourceLayout.height,
        width: sourceLayout.width,
      },
    ]}>
    <Icon name="play-circle" color={'#d2d2d2'} size={48} />
    <View style={styles.textBox}>
      <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
        {question}
      </Text>
    </View>
    <View
      style={{
        backgroundColor: '#ffe8c7',
        padding: 8,
        borderRadius: 24,
      }}>
      <Icon name="lock" color="#ffb933" size={28}></Icon>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    position: 'absolute',
    zIndex: 9999999,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  textBox: {flex: 1, marginHorizontal: 12},
  title: {
    fontSize: 14,
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
});
