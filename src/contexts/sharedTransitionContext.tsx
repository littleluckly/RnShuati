import React, {createContext, useReducer, useContext, ReactNode} from 'react';

// 定义状态类型
interface SharedTransitionState {
  isTransitioning: boolean;
}

// 定义Action类型
type SharedTransition = {type: 'START'} | {type: 'STOP'};

// 定义Context类型
interface SharedTransitionContextType {
  state: SharedTransitionState;
  dispatch: React.Dispatch<SharedTransition>;
}

// 创建上下文并指定类型，初始值为undefined（将在Provider中提供实际值）
const CounterContext = createContext<SharedTransitionContextType | undefined>(
  undefined,
);

// Reducer函数
const reducer = (
  state: SharedTransitionState,
  action: SharedTransition,
): SharedTransitionState => {
  switch (action.type) {
    case 'START':
      return {...state, isTransitioning: true};
    case 'STOP':
      return {...state, isTransitioning: false};
    default:
      return state;
  }
};

// Provider组件，接受children作为参数
export const SharedTransitionProvider = ({children}: {children: ReactNode}) => {
  const [state, dispatch] = useReducer(reducer, {isTransitioning: false});

  return (
    <CounterContext.Provider value={{state, dispatch}}>
      {children}
    </CounterContext.Provider>
  );
};

// 自定义Hook，简化Context使用
export const useSharedTransition = () => {
  const context = useContext(CounterContext);
  if (context === undefined) {
    throw new Error('useCounter must be used within a CounterProvider');
  }
  return context;
};
