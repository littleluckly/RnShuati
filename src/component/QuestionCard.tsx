'use client';

import React, {useState, useCallback, useMemo} from 'react';
import {StyleSheet, Share, Dimensions, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {
  Text,
  IconButton,
  Divider,
  Snackbar,
  useTheme,
} from 'react-native-paper';
import {QuestionCardProps} from './types';
import Markdown from 'react-native-markdown-display';
import GlobalStyles from '@/styles/globalStyles';

const {width, height} = Dimensions.get('window');

export default React.memo(
  ({
    id,
    question,
    shortAnswer,
    fullAnswer,
    initialFavorite = false,
    onDislike,
    onToggleFavorite,
    onDelete,
    style = {},
  }: QuestionCardProps) => {
    const theme = useTheme();
    const [showShort, setShowShort] = useState(false);
    const [showFull, setShowFull] = useState(false);
    const [favorite, setFavorite] = useState(initialFavorite);
    const [snack, setSnack] = useState(false);
    const [snackMsg, setSnackMsg] = useState('');

    // 动态问题文本高度状态
    const [questionHeight, setQuestionHeight] = useState(44); // 默认为2行高度

    const handleFavorite = useCallback(() => {
      setFavorite(prev => !prev);
      onToggleFavorite?.(!favorite);
      setSnackMsg(!favorite ? '已收藏' : '已取消收藏');
      setSnack(true);
    }, [favorite, onToggleFavorite]);

    const handleCopy = useCallback(() => {
      Share.share({message: `${question}\n\n${fullAnswer}`});
      setSnackMsg('已复制到分享');
      setSnack(true);
    }, [question, fullAnswer]);

    const handleDislike = useCallback(() => {
      onDislike?.();
      setSnackMsg('已点踩1');
      setSnack(true);
    }, [onDislike]);

    const handleDelete = useCallback(() => {
      onDelete?.(id);
      setSnackMsg('已删除');
      setSnack(true);
    }, [onDelete, id]);

    const cardStyle = useMemo(
      () => [styles.card, {backgroundColor: theme.colors.surface}, style],
      [theme.colors.surface, style],
    );

    const sectionTitleStyle = useMemo(
      () => [styles.sectionTitle, {color: theme.colors.primary}],
      [theme.colors.primary],
    );

    // 动态计算 scrollableAnswerArea 的高度 - 基于实际问题文本高度
    const scrollableAreaHeight = useMemo(() => {
      // 总卡片高度减去固定区域的高度
      const questionContentPadding = 16; // questionContent 的上下 padding (8*2)
      const topDividerHeight = 1; // 上方 Divider 高度
      const bottomDividerHeight = 1; // 下方 Divider 高度
      const fixedActionsAreaHeight = 60; // 操作区域高度 (增加到60px确保足够空间)

      // 使用实际测量的问题文本高度
      const actualQuestionAreaHeight = questionHeight + questionContentPadding;

      const totalCardHeight = height - 220; // 卡片总高度
      const usedHeight =
        actualQuestionAreaHeight +
        topDividerHeight +
        bottomDividerHeight +
        fixedActionsAreaHeight;
      const availableScrollHeight = totalCardHeight - usedHeight;

      // 确保最小高度，防止负数
      return Math.max(availableScrollHeight, 100);
    }, [questionHeight]);

    // 处理问题文本高度测量
    const handleQuestionLayout = useCallback((event: any) => {
      const {height: measuredHeight} = event.nativeEvent.layout;
      // 更新问题文本的实际高度
      setQuestionHeight(measuredHeight);
      console.log('📏 问题文本高度测量:', measuredHeight);
    }, []);

    return (
      <View style={cardStyle} pointerEvents="auto">
        <View style={styles.questionContent}>
          <Text
            variant="titleMedium"
            style={styles.question}
            numberOfLines={2}
            ellipsizeMode="tail"
            onLayout={handleQuestionLayout}>
            {question}
          </Text>
        </View>
        <Divider bold style={[GlobalStyles.shadow, {elevation: 4}]} />

        {/* 可滚动答案区域 */}
        <View
          style={[
            styles.scrollableAnswerArea,
            {height: scrollableAreaHeight}, // ✅ 明确设置高度
          ]}
          pointerEvents="auto">
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            bounces={true}
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled">
            {/* 精简答案 */}
            {shortAnswer && (
              <>
                <View style={styles.contentPadding}>
                  <Text
                    variant="labelLarge"
                    style={sectionTitleStyle}
                    onPress={() => setShowShort(!showShort)}>
                    {'精简答案'}
                  </Text>
                  {/* <Text variant="bodyMedium" style={styles.answer}>
                    {shortAnswer}
                  </Text> */}
                  <Markdown>{shortAnswer}</Markdown>
                </View>
              </>
            )}

            {/* 详细解析 */}
            {fullAnswer && (
              <>
                {/* <Divider bold style={{marginVertical: 12}} /> */}
                <View style={styles.contentPadding}>
                  <Text
                    variant="labelLarge"
                    style={sectionTitleStyle}
                    onPress={() => setShowFull(!showFull)}>
                    {'详细解析'}
                  </Text>
                  {/* <Text variant="bodyMedium" style={styles.answer}>
                    {fullAnswer}
                  </Text> */}

                  <Markdown>{fullAnswer}</Markdown>
                </View>
              </>
            )}
          </ScrollView>
        </View>

        {/* 固定高度操作区域 - 绝对定位在底部 */}
        <View style={[styles.fixedActionsArea]}>
          <View style={styles.actions}>
            <IconButton
              icon={favorite ? 'star' : 'star-outline'}
              iconColor={favorite ? theme.colors.primary : undefined}
              onPress={handleFavorite}
            />
            <IconButton icon="trash-can-outline" onPress={handleDelete} />
            <IconButton icon="content-copy" onPress={handleCopy} />
          </View>
        </View>

        {/* 轻提示 */}
        {/* <Snackbar
          visible={snack}
          onDismiss={() => setSnack(false)}
          duration={800}>
          {snackMsg}
        </Snackbar> */}
      </View>
    );
  },
  (prevProps: QuestionCardProps, nextProps: QuestionCardProps) => {
    return (
      prevProps.question === nextProps.question &&
      prevProps.shortAnswer === nextProps.shortAnswer &&
      prevProps.fullAnswer === nextProps.fullAnswer &&
      prevProps.initialFavorite === nextProps.initialFavorite
    );
  },
);

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    // 调整高度：计数器(60px) + 间距(12px) + 额外空间(18px) + 底部空间(30px) = 120px
    height: height - 220,
    flexDirection: 'column',
    position: 'relative', // 为绝对定位的子元素提供参考
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  fixedQuestionArea: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  question: {
    marginBottom: 8,
    lineHeight: 22,
    fontWeight: '600',
    // 限制题目最多显示2行，超出部分显示省略号
    maxHeight: 44, // 2行的高度：22 * 2 = 44px
    overflow: 'hidden',
  },
  // 可滚动答案区域 - 占用剩余空间
  scrollableAnswerArea: {
    // flex: 1, // 占用题目区域和操作区域之间的所有剩余空间
    backgroundColor: '#fafafa', // 添加背景色以便调试和视觉区分
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20, // 底部留白，避免内容贴边
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  // 固定高度操作区域 - 使用绝对定位确保始终在底部
  fixedActionsArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'white', // 与卡片背景一致
    justifyContent: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    // 添加上边框以与内容区分离
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  answer: {
    marginTop: 6,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
