import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import {questionApiService} from '@/services';
import {
  Question,
  Pagination,
  FilteredQuestionListConfig,
} from '@/services/apiTypes';

// 定义状态类型
interface QuestionContextState {
  questions: Question[];
  pagination: Pagination;
  filters: {
    difficulty?: string | string[];
    tags?: string[];
  };
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  subjectId: string;
  deletedCount: number; // Track deleted cards separately
}

// 定义Action类型
type QuestionContextAction =
  | {type: 'SET_SUBJECT_ID'; payload: string}
  | {
      type: 'SET_FILTERS';
      payload: {difficulty?: string | string[]; tags?: string[]};
    }
  | {type: 'SET_LOADING'; payload: boolean}
  | {type: 'SET_REFRESHING'; payload: boolean}
  | {type: 'SET_QUESTIONS'; payload: Question[]}
  | {type: 'ADD_QUESTIONS'; payload: Question[]}
  | {type: 'SET_PAGINATION'; payload: Pagination}
  | {type: 'SET_HAS_MORE'; payload: boolean}
  | {type: 'RESET'}
  | {type: 'DELETE_QUESTION'; payload: string}
  | {type: 'SET_DELETED_COUNT'; payload: number}; // Add action for setting deleted count

// 定义Context类型
interface QuestionContextType {
  state: QuestionContextState;
  dispatch: React.Dispatch<QuestionContextAction>;
  fetchData: (pageNumber?: number, isRefreshing?: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
  loadMore: () => Promise<void>;
  updateFilters: (filters: {
    difficulty?: string | string[];
    tags?: string[];
  }) => void;
  deleteQuestion: (questionId: string) => void; // 添加删除题目方法
}

// 创建上下文并指定类型，初始值为undefined
const QuestionContext = createContext<QuestionContextType | undefined>(
  undefined,
);

// 初始状态
const initialState: QuestionContextState = {
  questions: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {},
  loading: false,
  refreshing: false,
  hasMore: true,
  subjectId: '',
  deletedCount: 0, // Initialize deleted count
};

// Reducer函数
const reducer = (
  state: QuestionContextState,
  action: QuestionContextAction,
): QuestionContextState => {
  switch (action.type) {
    case 'SET_SUBJECT_ID':
      return {
        ...state,
        subjectId: action.payload,
        questions: [],
        pagination: initialState.pagination,
        deletedCount: 0,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload,
        questions: [],
        pagination: initialState.pagination,
        deletedCount: 0,
      };
    case 'SET_LOADING':
      return {...state, loading: action.payload};
    case 'SET_REFRESHING':
      return {...state, refreshing: action.payload};
    case 'SET_QUESTIONS':
      return {...state, questions: action.payload};
    case 'ADD_QUESTIONS':
      // 避免添加重复的题目
      const newQuestions = action.payload.filter(
        newQuestion => !state.questions.some(q => q._id === newQuestion._id),
      );
      return {...state, questions: [...state.questions, ...newQuestions]};
    case 'SET_PAGINATION':
      // Adjust the total to account for deleted cards
      const adjustedPagination = {
        ...action.payload,
        total: Math.max(0, action.payload.total - state.deletedCount),
      };
      return {...state, pagination: adjustedPagination};
    case 'SET_HAS_MORE':
      return {...state, hasMore: action.payload};
    case 'RESET':
      return {...initialState, subjectId: state.subjectId};
    case 'DELETE_QUESTION':
      const newDeletedCount = state.deletedCount + 1;
      return {
        ...state,
        questions: state.questions.filter(
          question => question._id !== action.payload,
        ),
        deletedCount: newDeletedCount,
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1),
          totalPages: Math.max(
            1,
            Math.ceil(
              Math.max(0, state.pagination.total - 1) / state.pagination.limit,
            ),
          ),
        },
      };
    case 'SET_DELETED_COUNT':
      return {
        ...state,
        deletedCount: action.payload,
        pagination: {
          ...state.pagination,
          total: Math.max(
            0,
            state.pagination.total - action.payload + state.deletedCount,
          ),
        },
      };
    default:
      return state;
  }
};

// Provider组件
interface QuestionProviderProps {
  children: ReactNode;
  initialSubjectId?: string;
}

export const QuestionProvider = ({
  children,
  initialSubjectId = '',
}: QuestionProviderProps) => {
  // 使用初始主题ID更新初始状态
  const adjustedInitialState = {
    ...initialState,
    subjectId: initialSubjectId,
  };

  const [state, dispatch] = useReducer(reducer, adjustedInitialState);

  // 获取题目数据
  const fetchData = useCallback(
    async (pageNumber = 1, isRefreshing = false) => {
      try {
        dispatch({type: 'SET_REFRESHING', payload: isRefreshing});
        dispatch({type: 'SET_LOADING', payload: true});

        const config: FilteredQuestionListConfig = {
          subjectId: state.subjectId,
          limit: 10,
          page: pageNumber,
          ...state.filters,
        };

        const response = await questionApiService.getFilteredQuestionList(
          config,
        );

        if (response.success && response.data?.questions) {
          const questions = response.data.questions || [];
          const pagination =
            response.data.pagination || initialState.pagination;

          dispatch({type: 'SET_PAGINATION', payload: pagination});
          dispatch({type: 'SET_HAS_MORE', payload: pagination.hasNext});

          if (isRefreshing || pageNumber === 1) {
            dispatch({type: 'SET_QUESTIONS', payload: questions});
          } else {
            dispatch({type: 'ADD_QUESTIONS', payload: questions});
          }
        }
      } catch (error) {
        console.error('获取题目列表失败:', error);
      } finally {
        dispatch({type: 'SET_LOADING', payload: false});
        dispatch({type: 'SET_REFRESHING', payload: false});
      }
    },
    [state.subjectId, state.filters],
  );

  // 刷新数据
  const refreshData = useCallback(async () => {
    await fetchData(1, true);
  }, [fetchData]);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (!state.pagination.hasNext || state.loading) return;
    await fetchData(state.pagination.page + 1);
  }, [state.pagination, state.loading, fetchData]);

  // 更新筛选条件
  const updateFilters = useCallback(
    (filters: {difficulty?: string | string[]; tags?: string[]}) => {
      dispatch({type: 'SET_FILTERS', payload: filters});
    },
    [],
  );

  // 删除题目
  const deleteQuestion = useCallback((questionId: string) => {
    dispatch({type: 'DELETE_QUESTION', payload: questionId});
  }, []);

  // 当主题ID或筛选条件变化时，重新获取数据
  useEffect(() => {
    if (state.subjectId) {
      fetchData(1);
    }
  }, [state.subjectId, state.filters, fetchData]);

  // 当主题ID从外部改变时更新状态
  useEffect(() => {
    if (initialSubjectId && initialSubjectId !== state.subjectId) {
      dispatch({type: 'SET_SUBJECT_ID', payload: initialSubjectId});
    }
  }, [initialSubjectId]);

  return (
    <QuestionContext.Provider
      value={{
        state,
        dispatch,
        fetchData,
        refreshData,
        loadMore,
        updateFilters,
        deleteQuestion,
      }}>
      {children}
    </QuestionContext.Provider>
  );
};

// 自定义Hook，简化Context使用
export const useQuestionContext = () => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error(
      'useQuestionContext must be used within a QuestionProvider',
    );
  }
  return context;
};