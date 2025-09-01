import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {View} from 'react-native';
import QuestionFilter from './component/QuestionFilter';
import QuestionList from './component/QuestionList';

export default function HomeScreen() {
  // 缺少一个科目选择页面
  const subjectId = '68b5a3e3673f967771ce64a3';
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
