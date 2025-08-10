// src/screens/ProfileScreen/index.tsx
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.center}>
      <Text style={styles.title}>👤 detail</Text>
      <Button
        title="to HomePage"
        onPress={() => navigation.navigate('HomePage')}></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 24},
});
