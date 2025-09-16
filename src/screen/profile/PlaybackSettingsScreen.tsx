import React, {useState, useEffect, useLayoutEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AudioManager, PlaybackContentSettings} from '@/services/AudioManager';
import Slider from '@react-native-community/slider';
import {useNavigation} from '@react-navigation/native';
import {HomeStackNavigation} from '@/navigation/Types';

export default function PlaybackSettingsScreen() {
  const navigation = useNavigation<HomeStackNavigation>();
  const insets = useSafeAreaInsets();

  // 禁用React Navigation的默认页头
  useLayoutEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  // 播放速度状态
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // 播放内容设置状态
  const [playbackContentSettings, setPlaybackContentSettings] =
    useState<PlaybackContentSettings>({
      includeSimpleAnswer: true,
      includeDetailAnswer: true,
    });

  // 初始化时加载当前设置
  useEffect(() => {
    loadCurrentSettings();
  }, []);

  // 加载当前设置
  const loadCurrentSettings = async () => {
    try {
      // 获取播放速度
      const speed = await AudioManager.getPlaybackSpeed();
      setPlaybackSpeed(speed);

      // 获取播放内容设置
      const contentSettings = AudioManager.getPlaybackContentSettings();
      setPlaybackContentSettings(contentSettings);
    } catch (error) {
      console.error('加载播放设置失败:', error);
    }
  };

  // 格式化速度显示文本
  const formatSpeedText = (speed: number): string => {
    if (speed === 1.0) return '正常';
    if (speed === 0.5) return '0.5x';
    if (speed === 1.5) return '1.5x';
    if (speed === 2.0) return '2.0x';
    return `${speed.toFixed(1)}x`;
  };

  // 处理播放速度变化
  const handleSpeedChange = async (speed: number) => {
    try {
      // 确保速度值在有效范围内
      const validSpeed = Math.max(0.5, Math.min(2.0, speed));
      setPlaybackSpeed(validSpeed);
      await AudioManager.setPlaybackSpeed(validSpeed);
    } catch (error) {
      console.error('设置播放速度失败:', error);
      Alert.alert('失败', '设置播放速度时出现错误');
    }
  };

  // 处理播放内容设置变化
  const handleContentSettingsChange = async (
    settings: PlaybackContentSettings,
  ) => {
    try {
      setPlaybackContentSettings(settings);
      await AudioManager.setPlaybackContentSettings(settings);
    } catch (error) {
      console.error('设置播放内容失败:', error);
      Alert.alert(
        '失败',
        error instanceof Error ? error.message : '设置播放内容时出现错误',
      );
      // 恢复之前的设置
      setPlaybackContentSettings(AudioManager.getPlaybackContentSettings());
    }
  };

  // 预设的播放速度选项
  const speedPresets = [0.5, 1.0, 1.5, 2.0];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>播放设置</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 设置内容区域 */}
      <View style={styles.content}>
        {/* 播放速度设置 */}
        <View style={styles.settingSection}>
          <Text style={styles.sectionTitle}>语音播放速度</Text>

          {/* 进度条控制 */}
          <View style={styles.sliderContainer}>
            <Text style={styles.speedLabel}>0.5x</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.1}
              value={playbackSpeed}
              onValueChange={handleSpeedChange}
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#DDD"
              thumbTintColor="#4CAF50"
            />
            <Text style={styles.speedLabel}>2.0x</Text>
          </View>

          {/* 预设速度按钮 */}
          <View style={styles.presetContainer}>
            {speedPresets.map(speed => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.presetButton,
                  playbackSpeed === speed && styles.presetButtonActive,
                ]}
                onPress={() => handleSpeedChange(speed)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.presetButtonText,
                    playbackSpeed === speed && styles.presetButtonTextActive,
                  ]}>
                  {formatSpeedText(speed)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 当前速度显示 */}
          <View style={styles.currentSpeedContainer}>
            <Text style={styles.currentSpeedText}>
              当前速度: {formatSpeedText(playbackSpeed)}
            </Text>
          </View>
        </View>

        {/* 播放内容设置 */}
        <View style={styles.settingSection}>
          <Text style={styles.sectionTitle}>播放内容设置</Text>

          {/* 内容选项开关 */}
          <View style={styles.contentOptionContainer}>
            <TouchableOpacity
              style={[
                styles.contentOption,
                playbackContentSettings.includeSimpleAnswer &&
                  styles.contentOptionSelected,
              ]}
              onPress={() => {
                // 确保至少有一个选项被选中
                if (
                  !playbackContentSettings.includeSimpleAnswer &&
                  !playbackContentSettings.includeDetailAnswer
                ) {
                  return;
                }
                handleContentSettingsChange({
                  ...playbackContentSettings,
                  includeSimpleAnswer:
                    !playbackContentSettings.includeSimpleAnswer,
                });
              }}
              activeOpacity={0.7}>
              <Text style={styles.contentOptionText}>精简答案</Text>
              {playbackContentSettings.includeSimpleAnswer && (
                <Icon name="check" size={16} color="#4CAF50" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contentOption,
                playbackContentSettings.includeDetailAnswer &&
                  styles.contentOptionSelected,
              ]}
              onPress={() => {
                // 确保至少有一个选项被选中
                if (
                  !playbackContentSettings.includeSimpleAnswer &&
                  !playbackContentSettings.includeDetailAnswer
                ) {
                  return;
                }
                handleContentSettingsChange({
                  ...playbackContentSettings,
                  includeDetailAnswer:
                    !playbackContentSettings.includeDetailAnswer,
                });
              }}
              activeOpacity={0.7}>
              <Text style={styles.contentOptionText}>扩展答案</Text>
              {playbackContentSettings.includeDetailAnswer && (
                <Icon name="check" size={16} color="#4CAF50" />
              )}
            </TouchableOpacity>
          </View>

          {/* 提示信息 */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              至少选择一个播放内容选项。详细解析不支持播放。
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  settingSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  speedLabel: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    width: '100%',
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  presetButtonActive: {
    backgroundColor: '#4CAF50',
  },
  presetButtonText: {
    fontSize: 14,
    color: '#666',
  },
  presetButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  currentSpeedContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  currentSpeedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  contentOptionContainer: {
    marginBottom: 16,
  },
  contentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#f0f0f0',
  },
  contentOptionSelected: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  contentOptionText: {
    fontSize: 14,
    color: '#333',
  },
  tipContainer: {
    paddingTop: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
