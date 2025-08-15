import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import React from 'react';

import ProfileScreen from '@/screen/profile/ProfileScreen';
import DetailScreen from '@/screen/home/DetailScreen';
import HomeStack from './HomeStack';
import LottieView from 'lottie-react-native';
import {routeNameMap} from './constant';
import {Host} from 'react-native-portalize';

const Tab = createBottomTabNavigator();

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
                source={require('../asset/lottie/lottie-home.json')}
                autoPlay
                loop={true}
                style={{width: 40, height: 40}}
              />
            ),
          }}
        />
        <Tab.Screen
          name={routeNameMap.profileTab}
          component={ProfileScreen}
          options={{
            headerShown: true,
            tabBarIcon: ({focused}) => (
              <LottieView
                source={
                  focused
                    ? require('../asset/lottie/lottie-profile.json')
                    : require('../asset/lottie/lottie-profile.json')
                }
                autoPlay
                loop={true}
                style={{width: 40, height: 40}}
              />
            ),
          }}
        />
        <Tab.Screen
          name="ThisRouteDoesNotShowBecauseOnlyFourAreInTabs"
          initialParams={{fromTab: 'bottom'}}
          component={DetailScreen}
        />
      </Tab.Navigator>
    </Host>
  );
};

export default RootTabNavigator;
