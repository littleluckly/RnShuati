// src/screens/ProfileScreen/index.tsx
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import {Ionicons} from 'react-native-vector-icons';
import React from 'react';
import {View, Text, StyleSheet, Touchable} from 'react-native';
import {Button} from 'react-native-paper';

export default function ProfileScreen() {
  return (
    <View style={[{flex: 1}]}>
      <View
        style={{
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 30,
        }}>
        <View
          style={{padding: 0.5, backgroundColor: '#f2f2f2', borderRadius: 48}}>
          <Ionicons name="person-circle-outline" size={96}></Ionicons>
        </View>
        <View
          style={{
            marginTop: 12,
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text>游客你好，</Text>
          <Button>立即登录</Button>
        </View>
      </View>
      <View style={styles.setItem}>
        <Ionicons name="heart" size={24} style={{marginRight: 6}}></Ionicons>
        <Text>我的收藏</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          style={{
            alignSelf: 'right',
            alignContent: 'right',
            marginLeft: 'auto',
          }}></Ionicons>
      </View>
      <View style={styles.setItem}>
        <Ionicons
          name="trash-outline"
          size={24}
          style={{marginRight: 6}}></Ionicons>
        <Text>我的删除</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          style={{
            alignSelf: 'right',
            alignContent: 'right',
            marginLeft: 'auto',
          }}></Ionicons>
      </View>
      <View style={styles.setItem}>
        <Ionicons
          name="create-outline"
          size={24}
          style={{marginRight: 6}}></Ionicons>
        <Text>我的编辑</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          style={{
            alignSelf: 'right',
            alignContent: 'right',
            marginLeft: 'auto',
          }}></Ionicons>
      </View>
      <View style={styles.setItem}>
        <MaterialDesignIcons
          name="account-tie-voice"
          size={24}
          style={{marginRight: 6}}></MaterialDesignIcons>
        <Text>我的语音包</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          style={{
            alignSelf: 'right',
            alignContent: 'right',
            marginLeft: 'auto',
          }}></Ionicons>
      </View>
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
});
