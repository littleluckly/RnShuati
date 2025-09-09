import React from 'react';
import {TouchableOpacity, Text, Animated} from 'react-native';
import {styles} from '../styles/styles';

interface PlayButtonProps {
  navOpacity: Animated.Value;
  navTranslateYBottom: Animated.Value;
  handlePlayPause: () => void;
  isPlaying: boolean;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  navOpacity,
  navTranslateYBottom,
  handlePlayPause,
  isPlaying,
}) => {
  return (
    <Animated.View
      style={[
        styles.playButtonContainer,
        {opacity: navOpacity, transform: [{translateY: navTranslateYBottom}]},
      ]}>
      <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
        <Text style={styles.playButtonText}>{isPlaying ? '停' : '听'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
