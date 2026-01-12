
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
    } catch (err: any) {
      console.error("App error handler caught:", err);
      
      let friendlyMessage = '음악 추천을 가져오는 중 오류가 발생했습니다.';
      
      if (err.message === 'API_KEY_MISSING') {
        friendlyMessage = 'API 키가 설정되지 않았습니다. 관리자에게 문의하세요.';
      } else if (err.message?.includes('404')) {
        friendlyMessage = '사용 가능한 AI 모델을 찾을 수 없습니다. (404 Error)';
      } else if (err.message?.includes('403')) {
        friendlyMessage = 'API 키 권한이 없거나 차단되었습니다. (403 Error)';
      } else if (err.message?.includes('429')) {
        friendlyMessage = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요. (429 Error)';
      } else if (err.message === 'EMPTY_RESPONSE') {
        friendlyMessage = 'AI가 응답을 생성하지 못했습니다. 다시 시도해 주세요.';
      } else if (err.name === 'SyntaxError') {
        friendlyMessage = '응답 데이터를 처리하는 중 오류가 발생했습니다. (JSON Error)';
      }
      
      setError(friendlyMessage);
      setStatus(AppState.ERROR);
    }
  }, []);

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
    <div className="min-h-screen bg-rose-50 text-gray-900 pb-20 transition-colors duration-500">
      <header className="sticky top-0 z-50 bg-rose-50/80 backdrop-blur-md border-b border-rose-100 px-6 py-4 flex items-center justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-rose-500 p-2 rounded-lg shadow-md shadow-rose-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-rose-900">PEP VIBE</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 mt-8">
        <section className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-2 text-rose-950">오늘의 출퇴근 메이트</h2>
          <p className="text-rose-700/70">지하철, 버스에서 듣기 좋은 음악을 매일 7개씩 추천해 드립니다.</p>
        </section>

        <form onSubmit={handleSubmit} className="mb-12">
          <div className="relative group">
            <input
              type="text"
              value={userTheme}
              onChange={(e) => setUserTheme(e.target.value)}
              placeholder="테마나 장르를 입력하세요 (예: 비 오는 날, 잔잔한 인디)"
              className="w-full bg-white/60 border-2 border-rose-100 rounded-2xl px-6 py-4 pr-32 focus:outline-none focus:border-rose-400 focus:bg-white transition-all text-lg shadow-sm"
            />
            <button
              type="submit"
              disabled={status === AppState.LOADING}
              className="absolute right-2 top-2 bottom-2 bg-rose-500 text-white px-6 rounded-xl font-bold hover:bg-rose-600 disabled:bg-gray-300 transition-colors shadow-lg shadow-rose-200"
            >
              {status === AppState.LOADING ? '추천 중...' : '추천받기'}
            </button>
          </div>
        </form>

        {status === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-rose-600 font-semibold animate-pulse">최고의 노래들을 찾고 있어요...</p>
          </div>
        )}

        {status === AppState.ERROR && (
          <div className="bg-white/80 border border-red-100 text-red-600 p-8 rounded-3xl text-center animate-fadeIn shadow-xl shadow-rose-100">
            <p className="font-bold mb-3 text-xl text-rose-800">문제가 발생했습니다</p>
            <p className="mb-6 text-rose-500 text-sm">{error}</p>
            <button 
              onClick={handleRefresh}
              className="bg-rose-500 text-white px-10 py-3 rounded-full font-bold hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-200"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {status === AppState.SUCCESS && recommendations && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-rose-900 leading-tight">
                 {recommendations.dailyThemeTitle || activeTheme}
              </h3>
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-white/50 hover:bg-white text-rose-600 px-4 py-2 rounded-full text-sm font-bold transition-colors border border-rose-100 shadow-sm"
              >
                재추천
              </button>
            </div>

            <div className="space-y-4">
              {recommendations.songs.map((song, idx) => (
                <MusicCard key={`${song.title}-${idx}`} song={song} index={idx} />
              ))}
            </div>

            <div className="mt-12 p-8 bg-rose-100/50 rounded-3xl text-center border border-rose-200">
              <p className="text-rose-900 font-bold mb-2">추천 곡 구성</p>
              <div className="flex justify-center gap-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-rose-600">5</span>
                  <span className="text-xs text-rose-400 font-bold uppercase">Korean</span>
                </div>
                <div className="w-px h-10 bg-rose-200 mt-2"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-rose-600">2</span>
                  <span className="text-xs text-rose-400 font-bold uppercase">Intl</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-rose-100 py-10 text-center text-rose-300 text-sm">
        <p>© 2024 PEP VIBE. Powered by Gemini API.</p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;