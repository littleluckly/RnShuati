// src/screens/ProfileScreen/index.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>👤 我的</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 24},
});
