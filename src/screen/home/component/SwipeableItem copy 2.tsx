import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {SharedValue, useAnimatedStyle} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';

interface Props {
  id: string;
  title: string;
  subtitle: string;
}

const SwipeableItem = ({id, title, subtitle}: Props) => {
  const navigation = useNavigation();

  /* ===== 右侧按钮 ===== */
  const RightActions = (
    prog: SharedValue<number>,
    drag: SharedValue<number>,
  ) => {
    const style = useAnimatedStyle(() => ({
      transform: [{translateX: drag.value}],
    }));
    return (
      <Animated.View style={[styles.rightActions]}>
        {['收藏', '编辑', '不喜欢'].map((label, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.action,
              {backgroundColor: ['#4CAF50', '#2196F3', '#F44336'][idx]},
            ]}
            onPress={() => console.log(`${label} ${id}`)}>
            <Text style={styles.actionText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };

  /* ===== 主内容 ===== */
  return (
    <Swipeable
      renderRightActions={RightActions}
      rightThreshold={72}
      friction={2}>
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Detail', {id})}>
        <Image
          source={{uri: 'https://via.placeholder.com/48'}}
          style={styles.icon}
        />
        <View style={styles.textBox}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

/* ===== 样式 ===== */
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    zIndex: 1,
  },
  icon: {width: 48, height: 48, borderRadius: 8},
  textBox: {flex: 1, marginLeft: 12},
  title: {fontSize: 16, fontWeight: '600', color: '#000'},
  subtitle: {fontSize: 14, color: '#666', marginTop: 2},
  rightActions: {flexDirection: 'row', elevation: 1},
  action: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {color: '#fff', fontSize: 12},
});

export default SwipeableItem;
