import GlobalStyles from '@/styles/globalStyles';
import React, {useEffect, useMemo} from 'react';
import {View, StyleSheet, Dimensions, ScrollView, Animated} from 'react-native';
import {Card, Text, TouchableRipple} from 'react-native-paper';

// 添加呼吸动画逻辑
const BreathingCard = ({style, children, delay}) => {
  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scaleAnim, {
          toValue: 1.03,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop();
  }, [scaleAnim, delay]);

  return (
    <Animated.View
      style={[style, styles.card, {transform: [{scale: scaleAnim}]}]}>
      {children}
    </Animated.View>
  );
};

// 获取屏幕宽度
const {width} = Dimensions.get('window');

// 卡片数据
const features = [
  {
    id: 1,
    title: '听力刷题',
    subtitle: '首创“本地语音包 + 用户自定义答案朗读”机制，通勤也能刷。',
    image: 'https://picsum.photos/id/1018/600/400', // 语音/音频相关（麦克风）
  },
  {
    id: 2,
    title: '智能组卷',
    subtitle: '10 秒生成一套“面试/考试”仿真卷，题型、题量、难度完全可配。',
    image: 'https://picsum.photos/id/1036/600/400', // 智能/大脑/科技感
  },
  {
    id: 3,
    title: '3D 卡片',
    subtitle: '手势滑动卡片，刷题像玩游戏；列表/卡片一键切换。',
    image: 'https://picsum.photos/id/237/600/400', // 手势/滑动/卡片（狗图，但有滑动感）
  },
  {
    id: 4,
    title: '众包答案',
    subtitle:
      '用户编辑的答案被官方采纳即可获得积分，积分可兑换语音音色、皮肤等。',
    image: 'https://picsum.photos/id/42/600/400', // 社区/协作/人群
  },
];

const FeatureCards = () => {
  return (
    <ScrollView contentContainerStyle={[styles.container]}>
      {features.map((feature, index) => (
        <BreathingCard
          key={feature.id}
          feature={feature}
          style={{borderRadius: 12}}
          delay={index * 500}>
          <Card.Cover source={{uri: feature.image}} style={styles.image} />
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              {feature.title}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {feature.subtitle}
            </Text>
          </Card.Content>
        </BreathingCard>
        // <Card key={feature.id} style={styles.card}>
        //   {/* 使用 TouchableRipple 包裹图片区域，实现水波纹 */}
        //   <TouchableRipple
        //     onPress={() => console.log(`点击了：${feature.title}`)}
        //     rippleColor="rgba(0, 122, 255, 0.3)" // iOS 蓝色水波纹
        //     borderless={true}
        //     style={styles.rippleContainer}>
        //     <Card.Cover source={{uri: feature.image}} style={styles.image} />
        //   </TouchableRipple>
        //   <Card.Content>
        //     <Text variant="titleLarge" style={styles.title}>
        //       {feature.title}
        //     </Text>
        //     <Text variant="bodyMedium" style={styles.subtitle}>
        //       {feature.subtitle}
        //     </Text>
        //   </Card.Content>
        // </Card>
      ))}
    </ScrollView>
  );
};

export default FeatureCards;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 36) / 2,
    marginBottom: 12,
    elevation: 4,
    backgroundColor: '#fff',
    overflow: 'hidden', // 确保水波纹不溢出
  },
  rippleContainer: {
    overflow: 'hidden',
    borderRadius: 15, // 与 Card.Cover 圆角一致
  },
  image: {
    height: 120,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#555',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});
