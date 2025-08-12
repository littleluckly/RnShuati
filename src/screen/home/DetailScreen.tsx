// src/screens/ProfileScreen/index.tsx
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
      <Button
        title="to HomePage"
        onPress={() => navigation.navigate(routeNameMap.homeScreen)}></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 24},
});
