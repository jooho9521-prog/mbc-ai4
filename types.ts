
export interface Song {
  title: string;
  artist: string;
  genre: string;
  isKorean: boolean;
  recommendationReason: string;
}

export interface RecommendationResponse {
  songs: Song[];
  dailyThemeTitle: string;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
