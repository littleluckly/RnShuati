import { Subject } from '@/services/apiTypes';
// 科目卡片组件 - 使用React Native内置动画系统
export interface SubjectCardProps {
  subject: Subject;
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
}