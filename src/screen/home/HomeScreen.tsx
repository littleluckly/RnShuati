import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import QuestionFilter from './component/QuestionFilter';
import QuestionList from './component/QuestionList';

export default function HomeScreen() {
  // 缺少一个科目选择页面
  const subjectId = '68b2df069200d29ad986a971';

  return (
    <View style={[{flex: 1}]}>
      <QuestionFilter />
      <View style={{flex: 1}}>
        <QuestionList subjectId={subjectId} />
      </View>
    </View>
  );
}
