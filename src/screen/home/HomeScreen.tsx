import {useNavigation} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import QuestionTypeSelector from './component/QuestionTypeSelector';

import QuestionFilter from './component/QuestionFilter';
export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <QuestionFilter />
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
