// navigation/HomeStack.tsx
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '@/screen/home/HomeScreen';
import DetailScreen from '@/screen/home/DetailScreen';
import {routeNameMap} from './constant';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen name={routeNameMap.homeScreen} component={HomeScreen} />
      <Stack.Screen name={routeNameMap.detailScreen} component={DetailScreen} />
    </Stack.Navigator>
  );
}
