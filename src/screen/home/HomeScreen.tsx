import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {View} from 'react-native';
import QuestionFilter from './component/QuestionFilter';
import QuestionList from './component/QuestionList';

export default function HomeScreen() {
  // 缺少一个科目选择页面
  const subjectId = '68bef2596ec254ab66383230';
  const [filters, setFilters] = useState({});

  return (
    <View style={[{flex: 1}]}>
      <QuestionFilter
        subjectId={subjectId}
        onFilterChange={newFilters => setFilters(newFilters)}
      />
      <View style={{flex: 1}}>
        <QuestionList subjectId={subjectId} filters={filters} />
      </View>
    </View>
  );
}
