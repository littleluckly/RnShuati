import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Slider from '@react-native-community/slider';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface PlaybackContentSettings {
  includeSimpleAnswer: boolean;
  includeDetailAnswer: boolean;
}

interface SettingsPanelProps {
  show: boolean;
  settingsPanelTranslateY: SharedValue<number>;
  settingsOverlayOpacity: SharedValue<number>;
  playbackSpeed: number;
  playbackContentSettings: PlaybackContentSettings;
  handleSpeedChange: (speed: number) => void;
  handleContentSettingsChange: (settings: PlaybackContentSettings) => void;
  animateSettingsPanel: (show: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  show,
  settingsPanelTranslateY,
  settingsOverlayOpacity,
  playbackSpeed,
  playbackContentSettings,
  handleSpeedChange,
  handleContentSettingsChange,
  animateSettingsPanel,
}) => {
  const insets = useSafeAreaInsets();

  // 创建遮罩层动画样式
  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: settingsOverlayOpacity.value,
    };
  });

  // 创建设置面板动画样式
  const panelAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: settingsPanelTranslateY.value}],
    };
  });

  // 格式化速度显示文本
  const formatSpeedText = (speed: number): string => {
    if (speed === 1.0) return '正常';
    if (speed === 0.5) return '0.5x';
    if (speed === 1.5) return '1.5x';
    if (speed === 2.0) return '2.0x';
    return `${speed.toFixed(1)}x`;
  };

  // 预设的播放速度选项
  const speedPresets = [0.5, 1.0, 1.5, 2.0];

  if (!show) return null;

  return (
    <>
      {/* 遮罩层 */}
      <Animated.View
        style={[styles.overlay, overlayAnimatedStyle]}
        onTouchEnd={() => animateSettingsPanel(false)}
      />

      {/* 设置面板 */}
      <Animated.View
        style={[
          styles.panel,
          panelAnimatedStyle,
          {
            paddingBottom: Math.max(insets.bottom, 16), // 确保在刘海屏上有足够的底部空间
          },
        ]}>
        {/* 面板标题和关闭按钮 */}
        <View style={styles.header}>
          <Text style={styles.title}>设置</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => animateSettingsPanel(false)}
            activeOpacity={0.7}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 播放速度设置 */}
        <View style={styles.settingSection}>
          <Text style={styles.settingTitle}>语音播放速度</Text>

          {/* 进度条控制 */}
          <View style={styles.sliderContainer}>
            <Text style={styles.speedLabel}>0.5x</Text>
            <Slider
              key={`slider-${playbackSpeed}`}
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
        <View style={[styles.settingSection, styles.borderTop]}>
          <Text style={styles.settingTitle}>播放内容设置</Text>

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

        {/* 面板底部空间 */}
        <View style={styles.bottomSpacer} />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 999,
    maxHeight: '70%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingSection: {
    padding: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  settingTitle: {
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
  },
  slider: {
    flex: 1,
    height: 40,
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
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
  bottomSpacer: {
    height: 20,
  },
});
