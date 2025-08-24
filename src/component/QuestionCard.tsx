'use client';

import React, {useState, useCallback, useMemo} from 'react';
import {StyleSheet, Share, Dimensions, ScrollView, View} from 'react-native';
import {
  Card,
  Text,
  IconButton,
  Divider,
  Snackbar,
  useTheme,
} from 'react-native-paper';
import {QuestionCardProps} from './types';
import GlobalStyles from '@/styles/globalStyles';

const {width, height} = Dimensions.get('window');

const QuestionCard = React.memo(
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

    const scrollableAnswerAreaHeight = useMemo(() => {
      return Dimensions.get('window').height - 360;
    }, []);

    return (
      <Card style={cardStyle}>
        <View style={styles.questionContent}>
          <Text
            variant="titleMedium"
            style={styles.question}
            numberOfLines={2}
            ellipsizeMode="tail">
            {question}
          </Text>
        </View>

        {/* 可滚动答案区域 */}
        <View
          style={[
            styles.scrollableAnswerArea,
            GlobalStyles.border,
            {minHeight: scrollableAnswerAreaHeight},
          ]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            bounces={true}
            showsVerticalScrollIndicator={true}>
            {/* 精简答案 */}
            {shortAnswer && (
              <>
                <Divider bold style={{marginBottom: 12}} />
                <Card.Content>
                  <Text
                    variant="labelLarge"
                    style={sectionTitleStyle}
                    onPress={() => setShowShort(!showShort)}>
                    {'精简答案'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.answer}>
                    {shortAnswer}
                  </Text>
                </Card.Content>
              </>
            )}

            {/* 详细解析 */}
            {fullAnswer && (
              <>
                <Divider bold style={{marginVertical: 12}} />
                <Card.Content>
                  <Text
                    variant="labelLarge"
                    style={sectionTitleStyle}
                    onPress={() => setShowFull(!showFull)}>
                    {'详细解析'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.answer}>
                    {fullAnswer}
                  </Text>
                </Card.Content>
              </>
            )}
          </ScrollView>
        </View>

        {/* 固定高度操作区域 (60px) */}
        <View style={styles.fixedActionsArea}>
          <Card.Actions style={styles.actions}>
            <IconButton
              icon={favorite ? 'star' : 'star-outline'}
              iconColor={favorite ? theme.colors.primary : undefined}
              onPress={handleFavorite}
            />
            <IconButton icon="trash-can-outline" onPress={handleDelete} />
            <IconButton icon="content-copy" onPress={handleCopy} />
          </Card.Actions>
        </View>

        {/* 轻提示 */}
        <Snackbar
          visible={snack}
          onDismiss={() => setSnack(false)}
          duration={800}>
          {snackMsg}
        </Snackbar>
      </Card>
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
    flex: 1, // 占用题目区域和操作区域之间的所有剩余空间
    minHeight: 200, // 设置最小高度确保答案区域可见
    backgroundColor: '#fafafa', // 添加背景色以便调试和视觉区分
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20, // 底部留白，避免内容贴边
  },
  // 固定高度操作区域 (70px) - 增加高度避免被压缩
  fixedActionsArea: {
    height: 70,
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default QuestionCard;
