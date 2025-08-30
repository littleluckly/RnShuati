import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import ProfileScreen from '@/screen/profile/ProfileScreen';
import DetailScreen from '@/screen/home/DetailScreen';
import HomeStack from './HomeStack';
import LottieView from 'lottie-react-native';
import {routeNameMap} from './constant';
import {Host} from 'react-native-portalize';
import ApiDemoScreen from '@/screen/profile/ApiDemoScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen
        name={routeNameMap.profileScreen}
        component={ProfileScreen}
        options={{title: '个人中心'}}
      />
      <Stack.Screen
        name="ApiDemo"
        component={ApiDemoScreen}
        options={{title: 'API 演示'}}
      />
    </Stack.Navigator>
  );
};

const RootTabNavigator: React.FC = () => {
  return (
    <Host>
      <Tab.Navigator
        initialRouteName={routeNameMap.homeTab}
        screenOptions={{headerShown: false}}>
        <Tab.Screen
          name={routeNameMap.homeTab}
          component={HomeStack}
          options={{
            tabBarIcon: ({focused}) => (
              <LottieView
                source={require('../assets/lottie/lottie-home.json')}
                autoPlay
                loop={true}
                style={{width: 40, height: 40}}
              />
            ),
          }}
        />
        <Tab.Screen
          name={routeNameMap.profileTab}
          component={ProfileStack}
          options={{
            headerShown: false,
            tabBarIcon: ({focused}) => (
              <LottieView
                source={
                  focused
                    ? require('../assets/lottie/lottie-profile.json')
                    : require('../assets/lottie/lottie-profile.json')
                }
                autoPlay
                loop={true}
                style={{width: 40, height: 40}}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </Host>
  );
};

export default RootTabNavigator;
