import {routeNameMap} from '@/navigation/constant';
import GlobalStyles from '@/styles/globalStyles';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Image,
  Dimensions,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Button} from 'react-native-paper';

// 获取屏幕宽度
const {width} = Dimensions.get('window');
export default function WelcomeScreen() {
  const navigation = useNavigation();
  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: '#f8f8f8',
      }}>
      <Image
        source={require('../../asset/image/work.png')}
        style={[
          {
            width: width - 30,
            resizeMode: 'contain', // 关键：防止图片变形或溢出
          },
        ]}
        accessibilityLabel="工作图片"
      />
      <View style={[styles.list]}>
        <Text>
          <Text style={[styles.listItemTitle]}>听力刷题</Text>
          ：首创“本地语音包映射 + 用户自定义答案朗读”机制，通勤也能刷。
        </Text>
      </View>

      <View style={[styles.list]}>
        <Text>
          <Text style={[styles.listItemTitle]}>智能组卷</Text>：10
          秒生成一套“面试/考试”仿真卷，题型、题量、难度完全可配。
        </Text>
      </View>
      <View style={[styles.list]}>
        <Text>
          <Text style={[styles.listItemTitle]}>3D 卡片</Text>
          ：手势滑动，刷题像玩游戏；列表/卡片一键切换。
        </Text>
      </View>
      <View style={[styles.list]}>
        <Text>
          <Text style={[styles.listItemTitle]}>众包答案</Text>
          ：用户编辑的答案被官方采纳即可获得积分，积分可兑换奖励等。
        </Text>
      </View>

      <View style={{flex: 1, justifyContent: 'flex-start', marginTop: 20}}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate(routeNameMap.homeScreen)}>
          开始刷题~
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 6,
    borderRadius: 12,
    elevation: 4,
  },
  listItemTitle: {color: 'black', fontSize: 16},
});
