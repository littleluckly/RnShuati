'use client';

// src/components/QuestionCard.js
import {useState} from 'react';
import {StyleSheet, Share, Dimensions} from 'react-native';
import {
  Card,
  Text,
  IconButton,
  Divider,
  Snackbar,
  useTheme,
} from 'react-native-paper';

const {width, height} = Dimensions.get('window');

export default function QuestionCard({
  question,
  shortAnswer,
  fullAnswer,
  initialFavorite = false,
  onDislike,
  onToggleFavorite,
  style = {},
}) {
  const theme = useTheme();
  const [showShort, setShowShort] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [favorite, setFavorite] = useState(initialFavorite);
  const [snack, setSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const handleFavorite = () => {
    setFavorite(!favorite);
    onToggleFavorite?.(!favorite);
    setSnackMsg(!favorite ? '已收藏' : '已取消收藏');
    setSnack(true);
  };

  const handleCopy = () => {
    Share.share({message: `${question}\n\n${fullAnswer}`});
    setSnackMsg('已复制到分享');
    setSnack(true);
  };

  return (
    <Card style={[styles.card, {backgroundColor: theme.colors.surface}, style]}>
      {/* 题目 */}
      <Card.Content style={styles.questionContent}>
        <Text variant="titleMedium" style={styles.question}>
          {question}
        </Text>
      </Card.Content>

      {/* 一般答案 */}
      {shortAnswer && (
        <>
          <Divider bold style={styles.divider} />
          <Card.Content>
            <Text
              variant="labelLarge"
              style={[styles.sectionTitle, {color: theme.colors.primary}]}
              onPress={() => setShowShort(!showShort)}>
              {'一般答案'}
            </Text>
            <Text variant="bodyMedium" style={styles.answer}>
              {shortAnswer}
            </Text>
          </Card.Content>
        </>
      )}

      {/* 全面答案 */}
      {fullAnswer && (
        <>
          <Divider bold style={styles.divider} />
          <Card.Content>
            <Text
              variant="labelLarge"
              style={[styles.sectionTitle, {color: theme.colors.primary}]}
              onPress={() => setShowFull(!showFull)}>
              {'全面答案'}
            </Text>
            <Text variant="bodyMedium" style={styles.answer}>
              {fullAnswer}
            </Text>
          </Card.Content>
        </>
      )}

      {/* 工具栏 */}
      <Divider bold style={styles.divider} />
      <Card.Actions style={styles.actions}>
        <IconButton
          icon={favorite ? 'star' : 'star-outline'}
          iconColor={favorite ? theme.colors.primary : undefined}
          onPress={handleFavorite}
        />
        <IconButton
          icon="trash-can-outline"
          onPress={() => {
            onDislike?.();
            setSnackMsg('已点踩');
            setSnack(true);
          }}
        />
        <IconButton icon="content-copy" onPress={handleCopy} />
      </Card.Actions>

      {/* 轻提示 */}
      <Snackbar
        visible={snack}
        onDismiss={() => setSnack(false)}
        duration={800}>
        {snackMsg}
      </Snackbar>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    height: height * 0.65,
  },
  questionContent: {
    paddingVertical: 20,
  },
  question: {
    marginBottom: 8,
    lineHeight: 24, // 增加行高提升可读性
    fontWeight: '600', // 增加字重
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 8,
  },
  answer: {
    marginTop: 6,
    lineHeight: 20, // 优化答案文本行高
  },
  actions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16, // 增加水平内边距
  },
});
