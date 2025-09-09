import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '@/navigation/Types';
import { routeNameMap } from '@/navigation/constant';

export type DetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  typeof routeNameMap.detailScreen
>;

export interface AudioPlaybackInfo {
  currentItemId: string | null;
  state: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  currentAudioIndex: number;
  totalAudios: number;
}