// src/screens/ProfileScreen/index.tsx
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import {Ionicons} from 'react-native-vector-icons';
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {resetOnboarding} from '../../utils/onboardingUtils'; // 导入重置新手引导的工具
import {useAuthContext} from '../../contexts/AuthContext'; // 导入认证上下文
import {routeNameMap} from '../../navigation/constant'; // 导入路由名称映射

export default function ProfileScreen() {
  const navigation = useNavigation();
  const {isAuthenticated, userInfo, logout} = useAuthContext();

  const navigateToApiDemo = () => {
    // @ts-ignore
    navigation.navigate('ApiDemo');
  };

  // 处理重置新手引导
  const handleResetOnboarding = () => {
    Alert.alert(
      '重置新手引导',
      '确定要重置新手引导吗？下次进入详情页时将重新显示新手引导。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: async () => {
            await resetOnboarding();
            Alert.alert('成功', '新手引导已重置');
          },
        },
      ],
      {cancelable: true},
    );
  };

  // 导航到播放设置页面
  const navigateToPlaybackSettings = () => {
    // @ts-ignore
    navigation.navigate('PlaybackSettings');
  };

  // 导航到我的下载页面
  const navigateToMyDownloads = () => {
    // @ts-ignore
    navigation.navigate('MyDownloads');
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      <View
        style={{
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 30,
        }}>
        <View
          style={{
            padding: 0.5,
            backgroundColor: '#f2f2f2',
            width: 96,
            height: 96,
            borderRadius: 48,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Ionicons name="person-circle-outline" size={96} color="#666" />
        </View>
        <View
          style={{
            marginTop: 12,
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          {isAuthenticated && userInfo ? (
            <View style={{alignItems: 'center'}}>
              <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 4}}>
                你好，{userInfo.username}
              </Text>
              {userInfo.email && (
                <Text style={{fontSize: 14, color: '#666', marginBottom: 8}}>
                  {userInfo.email}
                </Text>
              )}
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  backgroundColor: '#e74c3c',
                  borderRadius: 20,
                }}
                onPress={async () => {
                  try {
                    await logout();
                    Alert.alert('退出成功', '您已成功退出登录');
                  } catch (error) {
                    Alert.alert('退出失败', '退出登录时出现错误，请稍后再试');
                  }
                }}>
                <Text style={{color: '#fff', fontSize: 14}}>退出登录</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text>游客你好，</Text>
              <TouchableOpacity
                onPress={() =>
                  (navigation as any).navigate(routeNameMap.loginScreen)
                }>
                <Text style={{color: '#3498db', fontSize: 14}}>
                  立即登录/注册
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {/* 只有管理员角色才显示API演示选项 */}
      {isAuthenticated && userInfo && userInfo.role === 'admin' && (
        <TouchableOpacity style={styles.setItem} onPress={navigateToApiDemo}>
          <Ionicons
            name="code-outline"
            size={24}
            color="#3498db"
            style={{marginRight: 6}}
          />
          <Text style={{flex: 1}}>API 演示</Text>
          <Ionicons name="chevron-forward-outline" size={24}></Ionicons>
        </TouchableOpacity>
      )}
      <View style={styles.setItem}>
        <Ionicons
          name="heart"
          size={24}
          color="#e74c3c"
          style={{marginRight: 6}}
        />
        <Text style={{flex: 1}}>我的收藏</Text>
        <Ionicons name="chevron-forward-outline" size={24}></Ionicons>
      </View>
      <View style={styles.setItem}>
        <Ionicons
          name="trash-outline"
          size={24}
          style={{marginRight: 6}}></Ionicons>
        <Text style={{flex: 1}}>我的删除</Text>
        <Ionicons name="chevron-forward-outline" size={24}></Ionicons>
      </View>
      <View style={styles.setItem}>
        <Ionicons
          name="create-outline"
          size={24}
          style={{marginRight: 6}}></Ionicons>
        <Text style={{flex: 1}}>我的编辑</Text>
        <Ionicons name="chevron-forward-outline" size={24}></Ionicons>
      </View>
      {/* 播放设置选项 */}
      <TouchableOpacity
        style={styles.setItem}
        onPress={navigateToPlaybackSettings}>
        <Ionicons
          name="volume-high-outline"
          size={24}
          color="#3498db"
          style={{marginRight: 6}}
        />
        <Text style={{flex: 1}}>播放设置</Text>
        <Ionicons name="chevron-forward-outline" size={24}></Ionicons>
      </TouchableOpacity>

      {/* 我的下载选项 */}
      <TouchableOpacity
        style={styles.setItem}
        onPress={navigateToMyDownloads}>
        <Ionicons
          name="download-outline"
          size={24}
          color="#2ecc71"
          style={{marginRight: 6}}
        />
        <Text style={{flex: 1}}>我的下载</Text>
        <Ionicons name="chevron-forward-outline" size={24}></Ionicons>
      </TouchableOpacity>
      {/* 新增重置新手引导选项 */}
      {isAuthenticated && userInfo ? (
        <TouchableOpacity
          style={styles.setItem}
          onPress={handleResetOnboarding}>
          <Ionicons
            name="information-outline"
            size={24}
            color="#f39c12"
            style={{marginRight: 6}}
          />
          <Text style={{flex: 1}}>重置新手引导</Text>
          <Ionicons name="chevron-forward-outline" size={24}></Ionicons>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 24},
  setItem: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 48,
    padding: 12,
  },
  // 认证相关样式
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  divider: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  settingItemText: {
    fontSize: 16,
  },
});
