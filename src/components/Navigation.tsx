import React from 'react';
import { Sparkles, Database, History, Volume2, VolumeX } from 'lucide-react';
import { ActiveTab } from '../types';
import { sound } from '../utils/sound';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  questionsCount: number;
  historyCount: number;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  questionsCount,
  historyCount,
  isMuted,
  onToggleSound,
}) => {
  return (
    <header
      id="main-app-navigation"
      className="w-full border-b-[3px] sm:border-b-[4px] border-black bg-white select-none z-30 shrink-0"
    >
      <div className="w-full px-2 sm:px-4 py-1.5 sm:py-2 flex flex-row items-center justify-between gap-1.5 sm:gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-15 md:h-15 bg-black flex items-center justify-center text-white font-mono font-black text-base xs:text-lg sm:text-2xl md:text-3xl border-2 border-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
            YN
          </div>
          <div className="flex items-baseline gap-1 sm:gap-1.5 min-w-0">
            <span className="font-black font-mono tracking-tight text-xl xs:text-2xl sm:text-4xl md:text-5xl uppercase leading-none text-black">
              YES|NO
            </span>
            <span className="font-black font-mono tracking-tighter text-sm xs:text-base sm:text-2xl md:text-3xl uppercase leading-none text-neutral-700 -ml-0.5 sm:-ml-1">
              ORACLE
            </span>
          </div>
        </div>

        {/* All Top Buttons in One Single Line */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Arena Icon Button */}
          <button
            id="nav-tab-game"
            type="button"
            onClick={() => {
              sound.playClick(440);
              onSelectTab('GAME');
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center font-mono text-xs border-2 border-black transition-all active:scale-95 relative ${
              activeTab === 'GAME'
                ? 'bg-black text-white shadow-[1px_1px_0px_0px_#000000] sm:shadow-[2px_2px_0px_0px_#000000]'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
            title="Oracle Arena (Game)"
            aria-label="Oracle Arena"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Question Database Icon Button with Badge */}
          <button
            id="nav-tab-questions"
            type="button"
            onClick={() => {
              sound.playClick(440);
              onSelectTab('QUESTIONS');
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center font-mono text-xs border-2 border-black transition-all active:scale-95 relative ${
              activeTab === 'QUESTIONS'
                ? 'bg-black text-white shadow-[1px_1px_0px_0px_#000000] sm:shadow-[2px_2px_0px_0px_#000000]'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
            title={`Question Database (${questionsCount} questions)`}
            aria-label="Question Database"
          >
            <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] sm:text-[9px] font-mono font-black px-0.5 border border-white rounded-full min-w-[14px] text-center leading-tight">
              {questionsCount}
            </span>
          </button>

          {/* History Icon Button with Badge */}
          <button
            id="nav-tab-history"
            type="button"
            onClick={() => {
              sound.playClick(440);
              onSelectTab('HISTORY');
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center font-mono text-xs border-2 border-black transition-all active:scale-95 relative ${
              activeTab === 'HISTORY'
                ? 'bg-black text-white shadow-[1px_1px_0px_0px_#000000] sm:shadow-[2px_2px_0px_0px_#000000]'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
            title={`History (${historyCount}/12 rounds)`}
            aria-label="History"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] sm:text-[9px] font-mono font-black px-0.5 border border-white rounded-full min-w-[14px] text-center leading-tight">
              {historyCount}
            </span>
          </button>

          <div className="w-[1px] h-4 sm:h-5 bg-neutral-300 mx-0.5" />

          {/* Audio Mute Toggle */}
          <button
            id="toggle-sound-btn"
            type="button"
            onClick={onToggleSound}
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center border-2 border-black bg-white hover:bg-neutral-100 text-black transition-transform active:scale-95"
            title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-label="Toggle Sound"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
