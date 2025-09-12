import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
} from '@react-navigation/native';

import ProfileScreen from '@/screen/profile/ProfileScreen';
import HomeStack from './HomeStack';
import LottieView from 'lottie-react-native';
import {routeNameMap} from './constant';
import {Host} from 'react-native-portalize';
import ApiDemoScreen from '@/screen/profile/ApiDemoScreen';
import {QuestionProvider} from '@/contexts/QuestionContext';
import LoginScreen from '@/screen/auth/LoginScreen';
import RegisterScreen from '@/screen/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screen/auth/ForgotPasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 个人中心导航栈
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
      {/* 个人中心页面可以导航到登录页 */}
      <Stack.Screen
        name={routeNameMap.loginScreen}
        component={LoginScreen}
        options={{title: '登录', presentation: 'modal'}}
      />

      <Stack.Screen
        name={routeNameMap.registerScreen}
        component={RegisterScreen}
        options={{title: '注册', presentation: 'modal'}}
      />
      <Stack.Screen
        name={routeNameMap.forgotPasswordScreen}
        component={ForgotPasswordScreen}
        options={{title: '忘记密码', presentation: 'modal'}}
      />
    </Stack.Navigator>
  );
};

// 主应用导航组件
const RootAppNavigator: React.FC = () => {
  return (
    <Host>
      <QuestionProvider>
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName={routeNameMap.homeTab}
            screenOptions={{headerShown: false}}>
            <Tab.Screen
              name={routeNameMap.homeTab}
              component={HomeStack}
              options={({route}) => {
                const routeName =
                  getFocusedRouteNameFromRoute(route) ??
                  routeNameMap.subjectSelectionScreen;
                return {
                  tabBarStyle: {
                    display:
                      routeName === routeNameMap.subjectSelectionScreen
                        ? 'none'
                        : 'flex', // 使用'flex'而不是'block'，因为React Native样式系统使用flexbox
                  },
                  tabBarIcon: ({focused}) => (
                    <LottieView
                      source={require('../assets/lottie/lottie-home.json')}
                      autoPlay
                      loop={true}
                      style={{width: 40, height: 40}}
                    />
                  ),
                };
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
        </NavigationContainer>
      </QuestionProvider>
    </Host>
  );
};

// 应用的主导航组件
const RootStack: React.FC = () => {
  // 这里可以添加认证检查逻辑，决定是显示认证页面还是主应用
  // 目前直接返回主应用
  return <RootAppNavigator />;
};

export default RootStack;

// export default RootTabNavigator; // 注释掉原来的默认导出，使用新的RootStack组件作为默认导出
