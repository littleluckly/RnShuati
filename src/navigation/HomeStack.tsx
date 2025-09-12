// navigation/HomeStack.tsx
import React, {useEffect, useState} from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import HomeScreen from '@/screen/home/HomeScreen';
import DetailScreen from '@/screen/detail';
import {routeNameMap} from './constant';
import SubjectSelectionScreen from '@/screen/home/SubjectSelectionScreen';
import {Button, TextInput, ActivityIndicator} from 'react-native';
import SearchableHeader from './SearchableHeader';
import {QuestionProvider} from '@/contexts/QuestionContext';
import {
  getOrCreateAnonymousUserId,
  getSelectedSubject,
  isUserLoggedIn,
} from '@/utils/userStorageUtils';

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
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        setIsLoading(true);

        // 检查用户是否已登录
        const loggedIn = await isUserLoggedIn();

        // 获取或创建匿名用户ID
        if (!loggedIn) {
          const anonymousUserId = await getOrCreateAnonymousUserId();
          console.log('Anonymous user ID:', anonymousUserId);
        }

        // 检查用户是否已选择科目
        const selectedSubject = await getSelectedSubject();

        // 根据是否选择科目设置初始路由
        if (selectedSubject && selectedSubject.subjectId) {
          setInitialRoute(routeNameMap.homeScreen);
        } else {
          setInitialRoute(routeNameMap.subjectSelectionScreen);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // 出错时默认进入科目选择页面
        setInitialRoute(routeNameMap.subjectSelectionScreen);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  // 显示加载指示器
  if (isLoading || !initialRoute) {
    return (
      <ActivityIndicator
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        size="large"
        color="#007AFF"
      />
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: true,
        header: () => <SearchableHeader />,
      }}>
      <Stack.Screen
        name={routeNameMap.subjectSelectionScreen}
        component={SubjectSelectionScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name={routeNameMap.homeScreen} component={HomeScreen} />
      <Stack.Screen
        name={routeNameMap.detailScreen}
        component={DetailScreen}
        options={({route}: any) => ({
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
          // 隐藏头部
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  );
}
