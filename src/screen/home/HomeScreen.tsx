// src/screens/ProfileScreen/index.tsx
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.center}>
      <Text style={styles.title}>👤 home</Text>
      <Button title="to Detail" onPress={() => navigation.navigate('Detail')}>
        to detail
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 24},
});
