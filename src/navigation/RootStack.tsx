import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import React from 'react';

import CustomTabBar from './CustomTabBar';
import ProfileScreen from '@/screen/profile/ProfileScreen';
import DetailScreen from '@/screen/home/DetailScreen';
import HomeStack from './HomeStack';

const Tab = createBottomTabNavigator();

const RootTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{headerShown: false}}
      tabBar={({state, descriptors, navigation}: BottomTabBarProps) => (
        <CustomTabBar
          state={state}
          descriptors={descriptors}
          navigation={navigation}
        />
      )}>
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen
        name="TwoTab"
        options={{headerShown: true}}
        component={ProfileScreen}
      />
      <Tab.Screen
        name="ThisRouteDoesNotShowBecauseOnlyFourAreInTabs"
        initialParams={{fromTab: 'bottom'}}
        component={DetailScreen}
      />
    </Tab.Navigator>
  );
};

export default RootTabNavigator;
