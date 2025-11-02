import {routeNameMap} from '@/navigation/constant';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Dimensions,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import {Button, ActivityIndicator, Card} from 'react-native-paper';
import {SubjectApiService} from '@/services/subjectApiService';
import {UserActionApiService} from '@/services/userActionApiService';
import {Subject} from '@/services/apiTypes';
import GlobalStyles from '@/styles/globalStyles';
import {saveSelectedSubject} from '../../../utils/userStorageUtils';
import {subjectApiService, userActionApiService} from '@/services';

// 获取屏幕宽度
const {width} = Dimensions.get('window');

// 应用特色功能数据
const appFeatures = [
  {
    id: '1',
    title: '智能组卷',
    description: '题型/题量/难度，随心定制仿真卷。',
    icon: '🎯',
    color: '#FF6B6B',
  },
  {
    id: '2',
    title: '听力模式',
    description: '上班，通勤都能刷，碎片时间高效利用',
    icon: '🔊',
    color: '#4ECDC4',
  },
  {
    id: '3',
    title: '3D 卡片',
    description: '手势滑动，刷题如玩游戏。',
    icon: '📱',
    color: '#FFE66D',
  },
];

// 主题配色方案
const theme = {
  primary: '#6200EE',
  primaryLight: '#9747FF',
  primaryDark: '#3700B3',
  secondary: '#03DAC6',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  error: '#CF6679',
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#999999',
  },
};

// 科目卡片组件 - 使用React Native内置动画系统
interface SubjectCardProps {
  subject: Subject;
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
}

const SubjectCard = ({
  subject,
  isSelected,
  onPress,
  disabled,
}: SubjectCardProps) => {
  // 根据科目ID生成不同的背景颜色
  const getSubjectColor = (id: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C'];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} disabled={disabled}>
      <Card
        style={[styles.subjectCard, isSelected && styles.selectedSubjectCard]}
        elevation={isSelected ? 5 : 3}>
        <Card.Content>
          <View style={styles.subjectCardContent}>
            <View
              style={[
                styles.subjectIcon,
                {backgroundColor: getSubjectColor(subject._id)},
              ]}>
              <Text style={styles.subjectIconText}>
                {subject.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              {'questionCount' in subject &&
                typeof subject.questionCount === 'number' && (
                  <Text style={styles.subjectStats}>
                    共 {subject.questionCount} 题
                  </Text>
                )}
              <Text style={styles.subjectDescription} numberOfLines={2}>
                {subject.description}
              </Text>
            </View>
            {isSelected && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

export default function SubjectSelectionScreen() {
  const navigation = useNavigation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectApiService.getSubjects();
      if (response.success && response.data?.subjects) {
        console.log(
          'response.data.subjects',
          response.data.subjects.map(item => ({
            name: item.name,
            questionCount: item.questionCount,
          })),
        );
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      Alert.alert('错误', '获取科目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = async (
    subjectId: string,
    subjectName: string,
  ) => {
    try {
      // 设置选中状态以显示视觉反馈
      setSelectedSubject(subjectId);

      // 添加短暂延迟以展示选择效果
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await userActionApiService.selectSubject(subjectId);

      if (response.success) {
        // 保存用户选择的科目到本地存储
        await saveSelectedSubject(subjectId, subjectName);

        // 导航到主屏幕
        navigation.navigate(routeNameMap.homeScreen as never);
      } else {
        Alert.alert('错误', response.message || '选择科目失败');
        setSelectedSubject(null);
      }
    } catch (error) {
      console.error('Failed to select subject:', error);
      Alert.alert('错误', '选择科目失败');
      setSelectedSubject(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>加载科目中...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      <View style={styles.scrollContent}>
        {/* 顶部横幅 */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../assets/image/work.png')}
            style={[
              {
                width: width,
                height: 200,
                resizeMode: 'contain', // 关键：防止图片变形或溢出
              },
            ]}
            accessibilityLabel="工作图片"
          />
        </View>

        {/* 科目选择区域 */}
        <View style={styles.subjectSection}>
          <Text style={styles.sectionTitle}>选择你的科目</Text>
          <Text style={styles.sectionSubtitle}>
            选择一个科目开始你的学习之旅
          </Text>

          <View style={styles.subjectList}>
            {subjects?.map(subject => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                isSelected={selectedSubject === subject._id}
                onPress={() => handleSubjectSelect(subject._id, subject.name)}
                disabled={selectedSubject !== null}
              />
            ))}
          </View>

          {subjects.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>暂无科目数据</Text>
              <Button
                mode="contained"
                onPress={fetchSubjects}
                style={styles.retryButton}
                color={theme.primary}>
                重新加载
              </Button>
            </View>
          )}
        </View>

        {/* 应用特色功能介绍 */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>应用特色</Text>
          <Text style={styles.sectionSubtitle}>专为高效学习设计的强大功能</Text>

          <View style={styles.featuresGrid}>
            {appFeatures.map(feature => (
              <Card key={feature.id} style={styles.featureCard}>
                <Card.Content style={{alignItems: 'center'}}>
                  <View
                    style={[
                      styles.featureIcon,
                      {backgroundColor: feature.color},
                    ]}>
                    <Text style={styles.featureIconText}>{feature.icon}</Text>
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.text.secondary,
  },
  // 顶部横幅样式
  heroSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  heroImage: {
    resizeMode: 'cover',
    opacity: 0.9,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(98, 0, 238, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    maxWidth: 300,
  },
  // 科目选择区域样式
  subjectSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: theme.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  subjectList: {
    gap: 16,
  },
  subjectCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subjectCard: {
    borderRadius: 16,
    backgroundColor: theme.surface,
  },
  subjectCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  selectedSubjectCard: {
    borderWidth: 2,
    borderColor: theme.primary,
  },
  subjectIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 4,
  },
  subjectStats: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 4,
  },
  subjectDescription: {
    fontSize: 14,
    color: theme.text.disabled,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: theme.text.secondary,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  // 应用特色功能样式
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureCard: {
    width: (width - 56) / 2, // 两个卡片等宽，考虑间距
    borderRadius: 16,
    padding: 8,
    elevation: 3,
    backgroundColor: theme.surface,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconText: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 20,
  },
  // 底部CTA区域样式
  ctaSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    paddingVertical: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});
