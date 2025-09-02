import React from 'react';
import { View, StyleSheet } from 'react-native';
import { QuestionProvider } from '@/contexts/QuestionContext';
import QuestionFilter from './component/QuestionFilter';
import QuestionList from './component/QuestionList';

interface QuestionScreenProps {
  subjectId: string;
}

/**
 * 题目屏幕组件
 * 包含题目筛选器和题目列表
 * 使用QuestionProvider统一管理状态
 */
const QuestionScreen: React.FC<QuestionScreenProps> = ({ subjectId }) => {
  return (
    <QuestionProvider initialSubjectId={subjectId}>
      <View style={styles.container}>
        {/* 题目筛选器 */}
        <QuestionFilter subjectId={subjectId} />
        
        {/* 题目列表 */}
        <View style={styles.listContainer}>
          <QuestionList subjectId={subjectId} />
        </View>
      </View>
    </QuestionProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
});

export default QuestionScreen;