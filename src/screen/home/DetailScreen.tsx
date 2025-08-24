// src/screens/ProfileScreen/index.tsx
import Quiz3DCard from '@/component/Quiz3DCard';
import {routeNameMap} from '@/navigation/constant';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {HomeStackParamList} from '@/navigation/Types';

type DetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  typeof routeNameMap.detailScreen
>;

export default function DetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<DetailScreenRouteProp>();

  // 安全地解构 route.params，处理可能为 undefined 的情况
  const params = route.params || {id: '', currentIndex: 0};
  const {id, currentIndex = 0} = params;

  console.log('DetailScreen received params:', {id, currentIndex});

  return (
    <View style={styles.center}>
      <Quiz3DCard initialAnsweredCount={currentIndex} startFromQuestion={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 24},
});
