// navigation/HomeStack.tsx
import React, {useState} from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import HomeScreen from '@/screen/home/HomeScreen';
import DetailScreen from '@/screen/home/DetailScreen';
import {routeNameMap} from './constant';
import WelcomeScreen from '@/screen/home/WelcomeScreen';
import {Button, TextInput} from 'react-native';
import SearchableHeader from './SearchableHeader';

const Stack = createStackNavigator();

// 自定义过渡动画 - 性能优化版本
const customCardStyleInterpolator = ({current, layouts}: any) => {
  return {
    cardStyle: {
      // 🚀 简化动画，只使用透明度过渡减少GPU负载
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    },
  };
};
export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        header: () => <SearchableHeader />,
      }}>
      <Stack.Screen
        name={routeNameMap.welcomeScreen}
        component={WelcomeScreen}
        options={{}}
      />
      <Stack.Screen name={routeNameMap.homeScreen} component={HomeScreen} />
      <Stack.Screen
        name={routeNameMap.detailScreen}
        component={DetailScreen}
        options={{
          cardStyleInterpolator: customCardStyleInterpolator,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 350,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 250,
              },
            },
          },
          // 禁用手势返回，避免干扰共享元素动画
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
