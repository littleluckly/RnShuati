import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '@/navigation/Types';
import { routeNameMap } from '@/navigation/constant';
import { State } from 'react-native-track-player';

export type DetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  typeof routeNameMap.detailScreen
>;

export interface AudioPlaybackInfo {
  currentItemId: string | null;
  state: State;
  currentAudioIndex: number;
  totalAudios: number;
}