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

    // 计算 scrollableAnswerArea 的高度
    const scrollableAreaHeight = useMemo(() => {
      // 总卡片高度减去固定区域的高度
      const fixedQuestionAreaHeight = 60; // 估算或根据实际样式计算
      const fixedActionsAreaHeight = 70;
      const paddingAndSpacing = 20; // 额外的内边距和间距
      return (
        height -
        220 -
        fixedQuestionAreaHeight -
        fixedActionsAreaHeight -
        paddingAndSpacing
      );
    }, []);

    return (
      <View style={cardStyle} pointerEvents="auto">
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
            keyboardShouldPersistTaps="handled"
            onScroll={event => {
              console.log(
                '📝 ScrollView滚动事件触发:',
                event.nativeEvent.contentOffset.y,
              );
            }}
            onContentSizeChange={(contentWidth, contentHeight) => {
              console.log('📏 ScrollView内容尺寸变化:', {
                contentWidth,
                contentHeight,
              });
            }}
            onLayout={event => {
              console.log('📐 ScrollView布局信息:', event.nativeEvent.layout);
            }}>
            {/* 精简答案 */}
            {shortAnswer && (
              <>
                <Divider bold style={{marginBottom: 12}} />
                <View style={styles.contentPadding}>
                  <Text
                    variant="labelLarge"
                    style={sectionTitleStyle}
                    onPress={() => setShowShort(!showShort)}>
                    {'精简答案'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.answer}>
                    {shortAnswer}
                  </Text>
                </View>
              </>
            )}

            {/* 详细解析 */}
            {fullAnswer && (
              <>
                <Divider bold style={{marginVertical: 12}} />
                <View style={styles.contentPadding}>
                  <Text
                    variant="labelLarge"
                    style={sectionTitleStyle}
                    onPress={() => setShowFull(!showFull)}>
                    {'详细解析'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.answer}>
                    {fullAnswer}
                  </Text>
                </View>
              </>
            )}

            {/* 测试用的额外内容，确保ScrollView有足够高度可以滚动 */}
            <View style={styles.contentPadding}>
              <Text style={styles.answer}>
                🧪 测试滚动内容 -
                这里是额外添加的内容来测试ScrollView是否可以正常滚动。
                如果你能看到这段文字并且可以上下滚动，说明ScrollView工作正常。
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia
                voluptas sit aspernatur aut odit aut fugit, sed quia
                consequuntur magni dolores eos qui ratione voluptatem sequi
                nesciunt. At vero eos et accusamus et iusto odio dignissimos
                ducimus qui blanditiis praesentium voluptatum deleniti atque
                corrupti quos dolores et quas molestias excepturi sint occaecati
                cupiditate non provident.
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* 固定高度操作区域 (60px) */}
        <View style={styles.fixedActionsArea}>
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
        <Snackbar
          visible={snack}
          onDismiss={() => setSnack(false)}
          duration={800}>
          {snackMsg}
        </Snackbar>
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default QuestionCard;
