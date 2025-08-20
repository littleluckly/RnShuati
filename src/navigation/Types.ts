
// src/navigation/types.ts
import { NavigationProp } from "@react-navigation/native";
import { routeNameMap } from "./constant";

export type RootStackParamList = {
  [routeNameMap.homeTab]: undefined;
  [routeNameMap.profileTab]: undefined;
};

export type RootNavigation = NavigationProp<RootStackParamList>;

export type HomeStackParamList = {
  [routeNameMap.homeTab]: undefined;
  [routeNameMap.detailScreen]: { id: string };
};
export type HomeStackNavigation = NavigationProp<HomeStackParamList>;
