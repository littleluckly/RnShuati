import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface ProgressCounterProps {
  current: number;
  total: number;
  answered: number;
}

const ProgressCounter = React.memo(
  ({current, total, answered}: ProgressCounterProps) => {
    const remaining = current;
    const progress = (answered / total) * 100;

    return (
      <View style={styles.counterContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${progress}%`}]} />
        </View>
        <Text style={styles.counterText}>
          进度: {answered}/{total} · 剩余 {remaining} 张
        </Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  counterContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e1e8ed',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1da1f2',
    borderRadius: 3,
  },
  counterText: {
    fontSize: 15,
    color: '#657786',
    fontWeight: '600',
  },
});

export default ProgressCounter;
