// src/screens/ProfileScreen/index.tsx
import Quiz3DCard from '@/component/Quiz3DCard';
import {routeNameMap} from '@/navigation/constant';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import React, {Suspense} from 'react';
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
  const {id, currentIndex = 0} = params;

  console.log('DetailScreen received params:', {id, currentIndex});

  return (
    <View style={styles.center}>
      <Suspense
        fallback={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1da1f2" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        }>
        <Quiz3DCard
          initialAnsweredCount={currentIndex}
          startFromQuestion={id}
        />
      </Suspense>
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
