// src/screens/ProfileScreen/index.tsx
import Quiz3DCard from '@/component/Quiz3DCard';
import {routeNameMap} from '@/navigation/constant';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

export default function DetailScreen(props) {
  const navigation = useNavigation();
  const propsStringify = JSON.stringify(props);
  return (
    <View style={styles.center}>
      <Text style={styles.title}>👤 detail</Text>
      <Text>{propsStringify}</Text>
      <Quiz3DCard></Quiz3DCard>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 24},
});
