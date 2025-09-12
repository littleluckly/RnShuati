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
        contentContainerStyle={[styles.contentContainer, {flexGrow: 1}]}>
        <View style={[{flex: 1}, styles.flexCenter]}>
          <View style={styles.section}>
            <View style={styles.iconContainer}>
              <Icon name="touch-app" size={48} color="#1da1f2" />
            </View>
            <Text style={styles.description}>
              点击屏幕任意位置可以显示或隐藏顶部和底部导航栏，为您提供沉浸式阅读体验。
            </Text>
          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    justifyContent: 'center',
    marginBottom: 30,
  },
  flexCenter: {
    alignItems: 'center',
    justifyContent: 'center',
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
    color: 'white',
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
