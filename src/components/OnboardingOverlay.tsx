import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width, height} = Dimensions.get('window');

interface OnboardingOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  onComplete,
  onSkip,
}) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>跳过</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Icon name="touch-app" size={48} color="#1da1f2" />
          </View>
          <Text style={styles.title}>欢迎使用详情页</Text>
          <Text style={styles.description}>
            点击屏幕任意位置可以显示或隐藏顶部和底部导航栏，为您提供沉浸式阅读体验。
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Icon name="swipe" size={48} color="#1da1f2" />
          </View>
          <Text style={styles.title}>滚动隐藏导航栏</Text>
          <Text style={styles.description}>
            当您上下滚动内容时，导航栏会自动隐藏，让您专注于阅读内容。
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Icon name="arrow-back" size={48} color="#1da1f2" />
            <Icon
              name="arrow-forward"
              size={48}
              color="#1da1f2"
              style={styles.iconSpacing}
            />
          </View>
          <Text style={styles.title}>题目导航</Text>
          <Text style={styles.description}>
            使用底部导航栏的左右箭头按钮可以快速切换到上一题或下一题。
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Icon name="list" size={48} color="#1da1f2" />
          </View>
          <Text style={styles.title}>题目目录</Text>
          <Text style={styles.description}>
            点击目录按钮可以打开题目目录，方便您快速跳转到任意题目。
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Icon name="play-arrow" size={48} color="#1da1f2" />
          </View>
          <Text style={styles.title}>音频播放</Text>
          <Text style={styles.description}>
            点击播放按钮可以听取题目的音频讲解，支持播放、暂停和继续播放。
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Icon name="settings" size={48} color="#1da1f2" />
          </View>
          <Text style={styles.title}>设置选项</Text>
          <Text style={styles.description}>
            点击设置按钮可以访问更多功能，包括关闭新手引导。
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>开始使用</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 40,
    paddingBottom: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconSpacing: {
    marginLeft: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#1da1f2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingOverlay;
