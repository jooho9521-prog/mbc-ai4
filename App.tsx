
import React, { useState, useEffect, useCallback } from 'react';
import { Song, RecommendationResponse, AppState } from './types';
import { fetchMusicRecommendations } from './services/geminiService';
import { MusicCard } from './components/MusicCard';

const DEFAULT_THEME = "기분 좋은 아침 출근길";

const App: React.FC = () => {
  const [userTheme, setUserTheme] = useState('');
  const [activeTheme, setActiveTheme] = useState(DEFAULT_THEME);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const getMusic = useCallback(async (themeToUse: string) => {
    setStatus(AppState.LOADING);
    setError(null);
    try {
      const data = await fetchMusicRecommendations(themeToUse);
      setRecommendations(data);
      setStatus(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError('음악 추천을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      setStatus(AppState.ERROR);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    getMusic(DEFAULT_THEME);
  }, [getMusic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userTheme.trim()) {
      setActiveTheme(userTheme);
      getMusic(userTheme);
    }
  };

  const handleRefresh = () => {
    getMusic(activeTheme);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-indigo-900">Commute Harmony</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 mt-8">
        <section className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-2">오늘의 출퇴근 메이트</h2>
          <p className="text-gray-500">지하철, 버스에서 듣기 좋은 음악을 매일 7개씩 추천해 드립니다.</p>
        </section>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="relative group">
            <input
              type="text"
              value={userTheme}
              onChange={(e) => setUserTheme(e.target.value)}
              placeholder="음악 테마나 장르를 입력하세요 (예: 비 오는 날, 몽환적인 팝)"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 pr-32 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-lg shadow-sm"
            />
            <button
              type="submit"
              disabled={status === AppState.LOADING}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-300 transition-colors shadow-lg shadow-indigo-200"
            >
              {status === AppState.LOADING ? '추천 중...' : '추천받기'}
            </button>
          </div>
        </form>

        {/* Status Messages */}
        {status === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-semibold animate-pulse">테마에 맞는 최고의 노래들을 찾고 있어요...</p>
          </div>
        )}

        {status === AppState.ERROR && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-center">
            <p className="font-bold mb-2">앗! 문제가 생겼어요.</p>
            <p className="mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {/* Recommendations Content */}
        {status === AppState.SUCCESS && recommendations && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-indigo-600 text-sm font-bold uppercase tracking-wider mb-1 block">TODAY'S SELECTION</span>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">
                   {recommendations.dailyThemeTitle}
                </h3>
              </div>
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-bold transition-colors border border-gray-100"
                title="다른 곡 추천받기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                재추천
              </button>
            </div>

            <div className="space-y-4">
              {recommendations.songs.map((song, idx) => (
                <MusicCard key={`${song.title}-${idx}`} song={song} index={idx} />
              ))}
            </div>

            <div className="mt-12 p-8 bg-indigo-50 rounded-3xl text-center">
              <p className="text-indigo-900 font-bold mb-2">추천 곡 구성</p>
              <div className="flex justify-center gap-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-indigo-600">5</span>
                  <span className="text-xs text-indigo-400 font-bold">KOREAN</span>
                </div>
                <div className="w-px h-10 bg-indigo-200 mt-2"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-indigo-600">2</span>
                  <span className="text-xs text-indigo-400 font-bold">INTL</span>
                </div>
              </div>
              <p className="text-xs text-indigo-400 mt-4 italic">70:30 황금비율로 큐레이팅 되었습니다.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-100 py-10 text-center text-gray-400 text-sm">
        <p>© 2024 Commute Harmony. All music metadata curated by Gemini.</p>
      </footer>

      {/* Tailwind fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
