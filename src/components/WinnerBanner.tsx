import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Award, ArrowRight, XCircle, RotateCcw } from 'lucide-react';
import { DecisionAnswer } from '../types';
import { sound } from '../utils/sound';

interface WinnerBannerProps {
  isOpen: boolean;
  isWin: boolean;
  playerAnswer: DecisionAnswer | null;
  oracleAnswer: DecisionAnswer | null;
  questionText: string;
  onNextRound: () => void;
  onReplayQuestion?: () => void;
  currentStreak: number;
}

export const WinnerBanner: React.FC<WinnerBannerProps> = ({
  isOpen,
  isWin,
  playerAnswer,
  oracleAnswer,
  questionText,
  onNextRound,
  onReplayQuestion,
  currentStreak,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (isWin) {
        sound.playWin();
        // Fire monochrome confetti (pure black, stark white, silver, slate)
        const count = 75;
        const defaults = {
          origin: { y: 0.6 },
          colors: ['#000000', '#ffffff', '#525252', '#d4d4d4', '#171717'],
          disableForReducedMotion: true,
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      } else {
        sound.playLoss();
      }
    }
  }, [isOpen, isWin]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="winner-celebration-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs"
      >
        {/* Artistic Flair Poster Layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -3, y: 20 }}
          animate={{ opacity: 1, scale: 1, rotate: -1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, rotate: 0, y: 15 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className={`w-full max-w-md p-4 sm:p-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all ${
            isWin
              ? 'bg-black text-white border-[4px] sm:border-[6px] border-white'
              : 'bg-white text-black border-[4px] sm:border-[6px] border-black'
          }`}
        >
          {/* Top Banner Headline */}
          <div className="text-center mb-4 sm:mb-5">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1">
              {isWin ? (
                <>
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce" />
                  <span className="font-mono text-[10px] sm:text-xs tracking-[0.25em] font-black uppercase text-neutral-300">
                    MATCH CONFIRMED
                  </span>
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce" />
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  <span className="font-mono text-[10px] sm:text-xs tracking-[0.25em] font-black uppercase text-neutral-600">
                    DIVERGENCE
                  </span>
                </>
              )}
            </div>

            <h2
              id="celebration-banner-title"
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] leading-none"
            >
              {isWin ? 'WINNER!' : 'NO MATCH'}
            </h2>

            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider mt-1 opacity-80">
              {isWin
                ? 'Your intuition aligned with the Oracle!'
                : 'Your intuition diverged from the Oracle.'}
            </p>
          </div>

          {/* Context Question Box */}
          <div
            className={`p-3 sm:p-3.5 mb-3 sm:mb-4 border-2 ${
              isWin
                ? 'bg-neutral-900 border-neutral-700 text-white'
                : 'bg-neutral-100 border-neutral-300 text-black'
            }`}
          >
            <span className="block text-[9px] font-mono font-bold opacity-60 uppercase tracking-widest mb-0.5">
              QUESTION
            </span>
            <p className="text-sm sm:text-base font-black leading-snug font-mono line-clamp-3">
              "{questionText}"
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div
              className={`p-2 sm:p-2.5 text-center border-2 ${
                isWin
                  ? 'bg-black border-white text-white'
                  : 'bg-white border-black text-black'
              }`}
            >
              <span className="block text-[9px] font-mono uppercase tracking-widest opacity-70 mb-0.5">
                YOU CHOSE
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black">
                {playerAnswer}
              </div>
            </div>

            <div
              className={`p-2 sm:p-2.5 text-center border-2 ${
                isWin
                  ? 'bg-white border-white text-black shadow-[2px_2px_0px_0px_#ffffff]'
                  : 'bg-black border-black text-white shadow-[2px_2px_0px_0px_#000000]'
              }`}
            >
              <span className="block text-[9px] font-mono uppercase tracking-widest opacity-70 mb-0.5">
                ORACLE GAVE
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black">
                {oracleAnswer}
              </div>
            </div>
          </div>

          {/* Streak notification if applicable */}
          {isWin && currentStreak > 1 && (
            <div className="mb-4 text-center border border-dashed border-white/40 py-1 px-2 font-mono text-[10px] uppercase font-bold tracking-widest">
              🔥 {currentStreak} WINS IN A ROW!
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {onReplayQuestion && (
              <button
                id="replay-question-btn"
                type="button"
                onClick={onReplayQuestion}
                className={`w-full sm:w-auto px-3 py-2 sm:py-2.5 font-mono text-xs font-black uppercase tracking-wider border-2 flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  isWin
                    ? 'border-white bg-transparent text-white hover:bg-neutral-900'
                    : 'border-black bg-transparent text-black hover:bg-neutral-100'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>REPLAY</span>
              </button>
            )}

            <button
              id="next-round-celebration-btn"
              type="button"
              onClick={() => {
                sound.playClick(600);
                onNextRound();
              }}
              className={`w-full flex-1 py-2 sm:py-2.5 px-4 font-mono text-xs sm:text-sm font-black uppercase tracking-wider border-2 flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isWin
                  ? 'bg-white text-black border-white hover:bg-neutral-200 shadow-[2px_2px_0px_0px_#ffffff]'
                  : 'bg-black text-white border-black hover:bg-neutral-800 shadow-[2px_2px_0px_0px_#000000]'
              }`}
            >
              <span>NEXT ROUND</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
