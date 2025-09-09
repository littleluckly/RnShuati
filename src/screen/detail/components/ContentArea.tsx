import React from 'react';
import {View, ScrollView, TouchableOpacity, Text} from 'react-native';
import MarkdownWithHighlight from '@/component/markdown-hightlight/MarkdownWithHighlight';
import {styles} from '../styles/styles';
import he from 'he';

interface ContentAreaProps {
  contentScrollViewRef: React.RefObject<ScrollView>;
  handleScroll: (event: any) => void;
  toggleNav: () => void;
  question: string;
  simpleAnswer: string;
  detailAnswer: string;
  analysisAnswer: string;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
  contentScrollViewRef,
  handleScroll,
  toggleNav,
  question,
  simpleAnswer,
  detailAnswer,
  analysisAnswer,
}) => {
  // 解析 HTML 实体字符
  const decodedQuestion = he.decode(question);
  const decodedSimpleAnswer = he.decode(simpleAnswer);
  const decodedDetailAnswer = he.decode(detailAnswer || '暂无扩展答案');
  const decodedAnalysisAnswer = he.decode(analysisAnswer);

  return (
    <ScrollView
      ref={contentScrollViewRef}
      style={styles.contentContainer}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      onScroll={handleScroll}
      scrollEventThrottle={16}>
      <TouchableOpacity activeOpacity={1} onPress={toggleNav}>
        {/* 题目标题 - 更加突出显示 */}
        <Text style={styles.questionTitle}>{decodedQuestion}</Text>

        {/* 精简答案 */}
        <Text style={styles.sectionTitle}>精简答案</Text>
        <MarkdownWithHighlight content={decodedSimpleAnswer} />

        {/* 扩展答案 */}
        <Text style={styles.sectionTitle}>扩展答案</Text>
        <MarkdownWithHighlight content={decodedDetailAnswer} />

        {/* 详细解析 */}
        <Text style={styles.sectionTitle}>详细解析</Text>
        <MarkdownWithHighlight content={decodedAnalysisAnswer} />
      </TouchableOpacity>
    </ScrollView>
  );
};
