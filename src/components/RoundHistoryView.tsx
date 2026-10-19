import React from 'react';
import { History, Award, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import { RoundRecord } from '../types';
import { sound } from '../utils/sound';

interface RoundHistoryViewProps {
  history: RoundRecord[];
  onClearHistory: () => void;
  onBackToGame: () => void;
}

export const RoundHistoryView: React.FC<RoundHistoryViewProps> = ({
  history,
  onClearHistory,
  onBackToGame,
}) => {
  // Compute summary stats from last 12 rounds
  const totalRounds = history.length;
  const totalWins = history.filter((r) => r.isWin).length;
  const winRate = totalRounds > 0 ? Math.round((totalWins / totalRounds) * 100) : 0;

  const handleClear = () => {
    if (confirm('Clear the last 12 rounds history?')) {
      sound.playClick(300);
      onClearHistory();
    }
  };

  return (
    <div className="flex-1 p-2.5 sm:p-5 md:p-8 flex flex-col gap-4 sm:gap-6 overflow-y-auto font-mono bg-white">
      {/* Header Box */}
      <div
        id="round-history-header"
        className="bg-black text-white p-3.5 sm:p-5 md:p-6 border-[3px] sm:border-[6px] border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
      >
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />
            <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight">
              12-ROUND DECISION HISTORY
            </h1>
          </div>
          <p className="text-[10px] sm:text-xs text-neutral-300 tracking-wider uppercase">
            Chronological audit tape of the last 12 Oracle interactions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="history-back-to-arena-btn"
            type="button"
            onClick={onBackToGame}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-transparent hover:bg-neutral-800 text-white border sm:border-2 border-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Arena</span>
          </button>

          {history.length > 0 && (
            <button
              id="clear-round-history-btn"
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white hover:bg-neutral-200 text-black border sm:border-2 border-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>
      </div>

      {/* 12-Slot Visual Scorecard */}
      <div className="bg-white border-[3px] sm:border-[6px] border-black p-3.5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] sm:shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
          <span className="text-xs font-black uppercase tracking-wider">
            12-SLOT MATRIX ({totalRounds}/12 SLOTS)
          </span>
          <div className="text-xs font-black flex items-center gap-4">
            <span>WINS: {totalWins}/{totalRounds}</span>
            <span>MATCH RATE: {winRate}%</span>
          </div>
        </div>

        {/* 12-Slot Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 mb-6">
          {Array.from({ length: 12 }).map((_, index) => {
            const record = history[index];

            if (!record) {
              return (
                <div
                  key={`empty-${index}`}
                  className="border-2 border-dashed border-neutral-300 h-20 flex flex-col items-center justify-center text-neutral-400"
                >
                  <span className="text-[10px] tracking-widest uppercase font-bold">SLOT #{index + 1}</span>
                  <span className="text-xs font-bold mt-1">—</span>
                </div>
              );
            }

            return (
              <div
                key={record.id}
                className={`border-2 border-black h-20 flex flex-col justify-between p-2 transition-all ${
                  record.isWin ? 'bg-black text-white' : 'bg-neutral-100 text-black'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[9px] opacity-80 uppercase font-bold">
                  <span>#{record.roundNumber}</span>
                  <span>{record.isWin ? 'WIN' : 'DIVERGE'}</span>
                </div>
                <div className="text-center font-black text-xs my-0.5">
                  {record.playerAnswer} / {record.oracleAnswer}
                </div>
                <div className="text-[8px] opacity-70 truncate text-center">
                  {record.questionText.slice(0, 18)}...
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Round Breakdown */}
        {history.length === 0 ? (
          <div className="py-8 text-center border-2 border-neutral-200 text-xs text-neutral-500 font-bold uppercase">
            No rounds recorded yet. Play a round in the Oracle arena to start filling the history!
          </div>
        ) : (
          <div className="space-y-2">
            <span className="block text-[11px] font-black uppercase tracking-wider text-neutral-500 mb-2">
              DETAILED AUDIT LOG (NEWEST FIRST)
            </span>
            <div className="space-y-2">
              {[...history].reverse().map((round) => (
                <div
                  key={round.id}
                  className={`border-2 border-black p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    round.isWin ? 'bg-neutral-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 border-2 border-black shrink-0 flex items-center justify-center text-xs font-bold ${
                        round.isWin ? 'bg-black text-white' : 'bg-white text-black'
                      }`}
                    >
                      {round.isWin ? <Award className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black">
                          ROUND #{round.roundNumber}
                        </span>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.2 border border-black uppercase ${
                            round.isWin ? 'bg-black text-white' : 'bg-neutral-200 text-black'
                          }`}
                        >
                          {round.isWin ? 'PLAYER WON' : 'DIVERGENCE'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-neutral-900 mt-0.5">
                        "{round.questionText}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs shrink-0 self-end sm:self-center border-t sm:border-t-0 border-neutral-200 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span className="block text-[9px] text-neutral-500 uppercase font-bold">You</span>
                      <span className="font-black">{round.playerAnswer}</span>
                    </div>
                    <span className="text-neutral-400 font-bold">/</span>
                    <div className="text-left sm:text-right">
                      <span className="block text-[9px] text-neutral-500 uppercase font-bold">Oracle</span>
                      <span className="font-black">{round.oracleAnswer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
