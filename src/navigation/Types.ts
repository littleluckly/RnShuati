
// src/navigation/types.ts
import { NavigationProp } from "@react-navigation/native";
import { routeNameMap } from "./constant";

export type RootStackParamList = {
  [routeNameMap.homeTab]: undefined;
  [routeNameMap.profileTab]: undefined;
  [routeNameMap.homeScreen]: { subjectName?: string };
  [routeNameMap.playbackSettingsScreen]: undefined;
};

export type RootNavigation = NavigationProp<RootStackParamList>;

export type HomeStackParamList = {
  [routeNameMap.homeTab]: undefined;
  [routeNameMap.homeScreen]: { subjectName?: string };
  [routeNameMap.detailScreen]: {
    id: string;
    currentIndex?: number;
    sourceLayout?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  [routeNameMap.playbackSettingsScreen]: undefined;
};
export type HomeStackNavigation = NavigationProp<HomeStackParamList>;


export type ProfileStackParamList = {
  [routeNameMap.profileTab]: undefined;
  [routeNameMap.profileScreen]: undefined;
  [routeNameMap.playbackSettingsScreen]: { from?: 'detailScreen' | 'profileScreen' | string };
};
export type ProfileStackNavigation = NavigationProp<ProfileStackParamList>;
