import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {Card} from 'react-native-paper';
import {SubjectCardProps} from './types';

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
const styles = StyleSheet.create({
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
});
export default SubjectCard;
