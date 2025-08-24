'use client';

import {useNavigation} from '@react-navigation/native';
import React, {forwardRef, useImperativeHandle} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import LinearGradient from 'react-native-linear-gradient';
// import {Icon} from 'react-native-paper';
import Icon from '@react-native-vector-icons/material-design-icons';
import {routeNameMap} from '@/navigation/constant';
import {HomeStackNavigation} from '@/navigation/Types';
import {QuestionMeta} from '@/models/QuestionMeta';
import Sound from 'react-native-sound';

interface Props {
  metadata: QuestionMeta;
  onWillOpen: (id: string) => void;
  setRef: (ref: any) => void;
}

const SwipeableItem = forwardRef((props: Props, _) => {
  const {id, question_markdown} = props.metadata;
  const {onWillOpen, setRef} = props;
  const navigation = useNavigation<HomeStackNavigation>();
  const swipeRef = React.useRef<any>();

  // 把内部 swipeRef 抛给父组件
  useImperativeHandle(_, () => swipeRef.current);
  React.useEffect(() => {
    setRef(swipeRef.current);
  }, [setRef]);

  /* 右侧按钮 - 美化版本 */
  const RightActions = () => {
    const buttons = [
      {
        label: '收藏',
        icon: '♥',
        gradientColors: ['#FF6B6B', '#FF8E8E'],
        shadowColor: '#FF6B6B',
      },
      {
        label: '编辑',
        icon: '✎',
        gradientColors: ['#4ECDC4', '#44A08D'],
        shadowColor: '#4ECDC4',
      },
      {
        label: '删除',
        icon: '✕',
        gradientColors: ['#FF6B6B', '#FF4757'],
        shadowColor: '#FF6B6B',
      },
    ];

    return (
      <View style={styles.rightActions}>
        {buttons.map((button, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.actionContainer,
              idx === buttons.length - 1 && styles.lastAction,
            ]}
            onPress={() => console.log(`${button.label} ${id}`)}>
            <LinearGradient
              colors={button.gradientColors}
              style={[
                styles.action,
                {
                  shadowColor: button.shadowColor,
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                },
                idx === buttons.length - 1 && {
                  borderTopRightRadius: 16,
                  borderBottomRightRadius: 16,
                },
              ]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <View style={styles.actionContent}>
                <Text style={styles.actionIcon}>{button.icon}</Text>
                <Text style={styles.actionText}>{button.label}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  let beepSound: Sound | null = null;
  const handleSpeak = () => {
    const filename = props.metadata.getAudioFiles().audio_question;
    console.log('filename', filename);
    beepSound = new Sound(filename, Sound.MAIN_BUNDLE, err => {
      if (err) {
        console.log('Failed to load the sound', err);
        return;
      }
      beepSound?.play(() => {
        beepSound?.release();
        beepSound = null;
      });
      console.log('Sound played');
    });
    // Tts.speak(question);
  };

  const handleStop = () => {
    beepSound?.pause();
    // Tts.stop();
  };
  return (
    <View style={styles.container}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={RightActions}
        onSwipeableWillOpen={() => onWillOpen(id)}
        friction={2}
        rightThreshold={20}>
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(routeNameMap.detailScreen, {id})}>
          <TouchableOpacity onPress={handleSpeak}>
            {/* pause-circle  play-circle*/}
            <Icon name="play-circle" color="#d2d2d2" size={48}></Icon>
          </TouchableOpacity>
          <View style={styles.textBox}>
            <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
              {question_markdown}
            </Text>
          </View>
          <View
            style={{backgroundColor: '#ffe8c7', padding: 8, borderRadius: 24}}>
            <Icon name="lock" color="#ffb933" size={28}></Icon>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
});

/* 美化后的样式 */
const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginHorizontal: 12,
    elevation: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
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
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: '100%',
  },
  actionContainer: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  action: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  lastAction: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  actionContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default SwipeableItem;
