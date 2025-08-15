
// src/navigation/types.ts
// export type RootStackParamList = {
//   HomeScreen: undefined;
//   DetailScreen: undefined;  // 如果有参数
//   Settings: undefined;
// };

import { NavigationProp } from "@react-navigation/native";
import { routeNameMap } from "./constant";

// 假设你的根导航类型
export type RootStackParamList = {
  [routeNameMap.homeTab]: undefined;
  [routeNameMap.profileTab]: undefined;
};

export type RootTabNavigation = NavigationProp<RootStackParamList>;