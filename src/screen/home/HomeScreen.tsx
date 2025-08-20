import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import QuestionFilter from './component/QuestionFilter';
import QuestionList from './component/QuestionList';

export default function HomeScreen() {
  return (
    <View style={[{flex: 1}]}>
      <QuestionFilter />
      <View style={{flex: 1}}>
        <QuestionList></QuestionList>
      </View>
    </View>
  );
}
