import React, {useState, useEffect} from 'react';
import {View, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {RootNavigation} from '../../navigation/Types';
import QuestionFilter from './component/QuestionFilter';
import QuestionList from './component/QuestionList';
import {
  getSelectedSubject,
  getOrCreateAnonymousUserId,
} from '../../utils/userStorageUtils';
import {userActionApiService} from '../../services';
import {useQuestionContext} from '../../contexts/QuestionContext';

export default function HomeScreen() {
  const [subjectInfo, setSubjectInfo] = useState<{
    subjectId: string;
    subjectName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<RootNavigation>();
  const {state: questionState} = useQuestionContext();
  const {pagination} = questionState;
  const [isFocused, setIsFocused] = useState(true); // 添加焦点状态

  // 监听页面焦点状态
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsFocused(true);
    });
    
    const blurUnsubscribe = navigation.addListener('blur', () => {
      setIsFocused(false);
    });

    return () => {
      unsubscribe();
      blurUnsubscribe();
    };
  }, [navigation]);

  // 当科目信息或题目总数变化时，更新导航参数，包含题目总数
  useEffect(() => {
    // 只有在页面处于焦点状态时才更新导航参数
    if (!isFocused) {
      return;
    }
    
    if (subjectInfo && subjectInfo.subjectName) {
      // 只有当数据加载完成且有题目时，才更新标题显示题目总数
      // 其他情况（加载中或没有题目时），保持标题不变
      let title = subjectInfo.subjectName;
      if (!questionState.loading) {
        const totalQuestions = pagination.total;
        // 格式化为："科目名称 (题目总数)"
        title = totalQuestions
          ? `${subjectInfo.subjectName} (${totalQuestions})`
          : subjectInfo.subjectName;
        // 更新当前路由的参数，而不是直接设置标题
        navigation.navigate({
          name: 'HomeScreen',
          params: {subjectName: title},
          merge: true,
        });
      }
      // 加载中或没有题目时，不更新标题，保持不变
    }
  }, [subjectInfo, navigation, pagination.total, questionState.loading, isFocused]);

  // 获取当前登录状态和科目信息
  const fetchSubjectInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 检查用户是否已登录（这里简单处理，实际项目中可能需要更复杂的认证逻辑）
      const anonymousUserId = await getOrCreateAnonymousUserId();
      const isLoggedIn = anonymousUserId === ''; // 如果返回空字符串，表示已登录

      if (isLoggedIn) {
        // 已登录用户，从API获取当前科目
        const response = await userActionApiService.getCurrentSubject();
        if (response.success && response.data) {
          setSubjectInfo({
            subjectId: response.data._id, // 使用正确的属性名_id
            subjectName: response.data.name,
          });
        } else {
          throw new Error(response.message || 'Failed to get current subject');
        }
      } else {
        // 未登录用户，从本地存储获取已选择的科目
        const storedSubject = await getSelectedSubject();
        if (storedSubject) {
          setSubjectInfo(storedSubject);
        } else {
          throw new Error('No subject selected');
        }
      }
    } catch (err) {
      console.error('Error fetching subject info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // 组件加载时获取科目信息
  useEffect(() => {
    fetchSubjectInfo();
  }, []);

  // 重新加载科目信息
  const reloadSubjectInfo = () => {
    fetchSubjectInfo();
  };

  // 加载中状态
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 错误状态
  if (error || !subjectInfo) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
        <Text style={{fontSize: 16, color: 'red', textAlign: 'center'}}>
          {error || 'No subject available. Please select a subject first.'}
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: '#007AFF',
            borderRadius: 5,
          }}
          onPress={reloadSubjectInfo}>
          <Text style={{color: 'white'}}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 从QuestionContext中获取当前的过滤条件
  const {filters: currentFilters} = questionState;

  return (
    <View style={[{flex: 1}]}>
      {/* QuestionFilter组件通过context管理过滤逻辑 */}
      <QuestionFilter subjectId={subjectInfo.subjectId} />
      <View style={{flex: 1}}>
        {/* 将当前的过滤条件传递给QuestionList组件 */}
        <QuestionList
          subjectId={subjectInfo.subjectId}
          filters={currentFilters}
        />
      </View>
    </View>
  );
}
