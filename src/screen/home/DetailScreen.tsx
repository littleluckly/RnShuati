import Quiz3DCard from '@/component/3Dcard/Quiz3DCard';
import {routeNameMap} from '@/navigation/constant';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import React, {Suspense, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
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
  const {id, currentIndex = 0, sourceLayout} = params;
  console.log('sourceLayout', sourceLayout);
  return (
    <View style={styles.center}>
      <Quiz3DCard
        initialAnsweredCount={currentIndex}
        startFromQuestion={id}
        sourceLayout={sourceLayout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 24},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#657786',
    fontWeight: '500',
  },
});
