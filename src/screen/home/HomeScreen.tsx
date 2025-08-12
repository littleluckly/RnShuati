import AnimatedBox from '@/component/AnimatedBox';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {Checkbox, Divider, IconButton, MD3Colors} from 'react-native-paper';
import QuestionTypeSelector from './component/QuestionTypeSelector';
import {routeNameMap} from '@/navigation/constant';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '@/navigation/Types';
import LottieView from 'lottie-react-native';

import globalStyles from '@/styles/globalStyles'; // 导入全局样式
import Search from './component/SearchBar';
export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={{marginVertical: 12}}>
        <Search />
      </View>
      <Text style={{fontSize: 16, marginBottom: 12}}>题型选择</Text>
      <QuestionTypeSelector />
      <View
        style={[
          {
            marginTop: 24,
            backgroundColor: 'white',
            borderRadius: 12,
            overflow: 'hidden',
          },
        ]}>
        <View style={{margin: 'auto', paddingTop: 24}}>
          <Text>请选择题型，筛选数据</Text>
        </View>
        <LottieView
          source={require('../../asset/lottie/lottie-no-data.json')}
          autoPlay
          loop={true}
          style={styles.lottieView}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flex: 1,
    justifyContent: 'flex-start',
  },
  lottieContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  lottieView: {
    width: '100%', // Adjust the width as needed
    aspectRatio: 1, // Maintain aspect ratio
    borderRadius: 12,
  },
});
