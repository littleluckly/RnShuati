import {useNavigation} from '@react-navigation/native';
import React, {forwardRef, useImperativeHandle} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

interface Props {
  id: string;
  title: string;
  subtitle: string;
  onWillOpen: (id: string) => void;
  setRef: (ref: any) => void;
}

const SwipeableItem = forwardRef((props: Props, _) => {
  const {id, title, subtitle, onWillOpen, setRef} = props;
  const navigation = useNavigation();
  const swipeRef = React.useRef<any>();

  // 把内部 swipeRef 抛给父组件
  useImperativeHandle(_, () => swipeRef.current);
  React.useEffect(() => {
    setRef(swipeRef.current);
  }, [setRef]);

  /* 右侧按钮 */
  const RightActions = () => {
    const buttons = ['收藏', '编辑', '不喜欢'];
    return (
      <View style={styles.rightActions}>
        {buttons.map((label, idx) => (
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
      </View>
    );
  };

  return (
    <View
      style={{
        marginTop: 12,
        marginHorizontal: 12,
        elevation: 4,
        backgroundColor: '#fff',
        borderRadius: 12,
      }}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={RightActions}
        onSwipeableWillOpen={() => onWillOpen(id)}
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
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
});

/* 样式不变 */
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  icon: {width: 48, height: 48, borderRadius: 8},
  textBox: {flex: 1, marginLeft: 12},
  title: {fontSize: 16, fontWeight: '600', color: '#000'},
  subtitle: {fontSize: 14, color: '#666', marginTop: 2},
  rightActions: {flexDirection: 'row'},
  action: {width: 72, justifyContent: 'center', alignItems: 'center'},
  actionText: {color: '#fff', fontSize: 12},
});

export default SwipeableItem;
