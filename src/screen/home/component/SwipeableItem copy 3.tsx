import React, {useRef} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {SharedValue, useAnimatedStyle} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';

interface Props {
  item: {
    id: string;
    title: string;
    subtitle: string;
  };
  onSwipeStart: (id: string) => void;
  onSwipeEnd: () => void;
  activeId: string | null;
  swipeableRef: (ref: any) => void;
}

const SwipeableItem = ({
  item,
  onSwipeStart,
  onSwipeEnd,
  activeId,
  swipeableRef,
}: Props) => {
  const navigation = useNavigation();
  const isSwipeableActive = activeId === item.id;
  const swipeableRefInner = useRef(null);

  React.useEffect(() => {
    swipeableRef(swipeableRefInner.current);
  }, [swipeableRef]);

  /* ===== 右侧按钮 ===== */
  const RightActions = (
    prog: SharedValue<number>,
    drag: SharedValue<number>,
  ) => {
    const style = useAnimatedStyle(() => ({
      transform: [{translateX: drag.value}],
    }));
    const buttons = ['收藏', '编辑', '不喜欢'];
    return (
      <Animated.View style={[styles.rightActions, {borderRadius: 12}]}>
        {buttons.map((label, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.action,
              {backgroundColor: ['#4CAF50', '#2196F3', '#F44336'][idx]},
              buttons.length - 1 === idx && {
                borderTopRightRadius: 12,
                borderBottomEndRadius: 12,
              },
            ]}
            onPress={() => console.log(`${label} ${item.id}`)}>
            <Text style={styles.actionText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };

  /* ===== 主内容 ===== */
  return (
    <View
      style={{
        marginTop: 12,
        marginHorizontal: 12,
        overflow: 'hidden',
        elevation: 4,
      }}>
      <Swipeable
        ref={swipeableRefInner}
        renderRightActions={RightActions}
        rightThreshold={72}
        friction={2}
        onSwipeableOpen={() => onSwipeStart(item.id)}
        onSwipeableClose={onSwipeEnd}
        disabled={!isSwipeableActive}>
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Detail', {id: item.id})}>
          <Image
            source={{uri: 'https://via.placeholder.com/48'}}
            style={styles.icon}
          />
          <View style={styles.textBox}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Text>
            <Text
              style={styles.subtitle}
              numberOfLines={2}
              ellipsizeMode="tail">
              {item.subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
};

/* ===== 样式 ===== */
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
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
