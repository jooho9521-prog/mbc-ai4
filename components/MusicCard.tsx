
import React from 'react';
import { Song } from '../types';

interface MusicCardProps {
  song: Song;
  index: number;
}

export const MusicCard: React.FC<MusicCardProps> = ({ song, index }) => {
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(song.artist + ' ' + song.title)}`;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {index + 1}
            </span>
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {song.isKorean ? 'KR' : 'INTL'}
            </span>
            <span className="text-xs font-medium text-gray-400">
              {song.genre}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {song.title}
          </h3>
          <p className="text-gray-600 font-semibold mb-3">{song.artist}</p>
          <p className="text-sm text-gray-500 leading-relaxed italic border-l-2 border-indigo-100 pl-3">
            "{song.recommendationReason}"
          </p>
        </div>
        
        <a 
          href={youtubeSearchUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-4 flex-shrink-0 flex items-center justify-center w-12 h-12 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
          title="유튜브에서 듣기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};
