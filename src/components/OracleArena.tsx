import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Shuffle, Check, Trophy, PenTool } from 'lucide-react';
import { Question, DecisionAnswer, GamePhase, RoundRecord } from '../types';
import { PulsingOrb } from './PulsingOrb';
import { WinnerBanner } from './WinnerBanner';
import { QuestionCreatorModal } from './QuestionCreatorModal';
import { sound } from '../utils/sound';
import { GameStats } from '../utils/storage';

interface OracleArenaProps {
  questions: Question[];
  onRecordRound: (record: Omit<RoundRecord, 'id' | 'timestamp'>) => void;
  recentRounds: RoundRecord[];
  currentStreak: number;
  stats: GameStats;
  onNavigateToQuestions: () => void;
  onStoreQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => Question;
  onStoreMultipleQuestions: (questions: Array<Omit<Question, 'id' | 'createdAt'>>) => void;
  selectedQuestionId?: string | null;
  onSelectQuestionId?: (id: string) => void;
}

// Cryptographically strong random decision generator (50/50 independent uniform distribution)
function getSecureRandomAnswer(): DecisionAnswer {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    return (buffer[0] & 1) === 1 ? 'YES' : 'NO';
  }
  return Math.random() < 0.5 ? 'YES' : 'NO';
}

export const OracleArena: React.FC<OracleArenaProps> = ({
  questions,
  onRecordRound,
  recentRounds,
  currentStreak,
  stats,
  onNavigateToQuestions: _onNavigateToQuestions,
  onStoreQuestion,
  onStoreMultipleQuestions,
  selectedQuestionId,
  onSelectQuestionId,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [playerAnswer, setPlayerAnswer] = useState<DecisionAnswer | null>(null);
  const [oracleAnswer, setOracleAnswer] = useState<DecisionAnswer | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('QUESTION_POP');
  const [isBannerOpen, setIsBannerOpen] = useState<boolean>(false);
  const [roundCounter, setRoundCounter] = useState<number>(() => {
    return (recentRounds[recentRounds.length - 1]?.roundNumber || 0) + 1;
  });

  // Modal for writing and generating questions
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [creatorInitialMode, setCreatorInitialMode] = useState<'WRITE' | 'GENERATE'>('WRITE');

  // Match selected question ID if passed
  useEffect(() => {
    if (selectedQuestionId && questions.length > 0) {
      const idx = questions.findIndex((q) => q.id === selectedQuestionId);
      if (idx !== -1) {
        setCurrentQuestionIndex(idx);
        setPlayerAnswer(null);
        setOracleAnswer(null);
        setGamePhase('QUESTION_POP');
        setIsBannerOpen(false);
      }
    }
  }, [selectedQuestionId, questions]);

  // Pick a random question
  const pickNewQuestion = useCallback(() => {
    if (questions.length === 0) return;
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestionIndex(randomIndex);
    if (onSelectQuestionId && questions[randomIndex]) {
      onSelectQuestionId(questions[randomIndex].id);
    }
    setPlayerAnswer(null);
    setOracleAnswer(null);
    setGamePhase('QUESTION_POP');
    setIsBannerOpen(false);
    sound.playClick(440);
  }, [questions, onSelectQuestionId]);

  // Initial question check
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      setCurrentQuestionIndex(0);
    }
  }, [questions, currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex] || {
    id: 'placeholder',
    text: 'Will you create your first custom question in the database?',
    category: 'Getting Started',
  };

  // Player selects YES or NO
  const handleSelectAnswer = (choice: DecisionAnswer) => {
    if (gamePhase === 'ORACLE_PULSING' || gamePhase === 'ANSWER_REVEAL') return;
    sound.playClick(choice === 'YES' ? 520 : 380);
    setPlayerAnswer(choice);
    setOracleAnswer(null);
    setGamePhase('PLAYER_CHOSEN');
  };

  // Player triggers Oracle
  const handleConsultOracle = () => {
    if (!playerAnswer || gamePhase === 'ORACLE_PULSING' || gamePhase === 'ANSWER_REVEAL') return;
    sound.playClick(600);

    // 1. Clear prior outcomes and enter pulsing animation phase
    setOracleAnswer(null);
    setGamePhase('ORACLE_PULSING');

    // 2. Generate a fresh, independent cryptographically uniform random answer (every consultation rolls anew)
    const outcome: DecisionAnswer = getSecureRandomAnswer();

    // 3. After 2.2 seconds of pulsing graphic, reveal the fresh random answer
    setTimeout(() => {
      setOracleAnswer(outcome);
      setGamePhase('ANSWER_REVEAL');

      // 4. After answer reveal, record the round and show the celebration banner
      setTimeout(() => {
        const isWin = playerAnswer === outcome;
        setGamePhase('RESULT_CELEBRATE');

        // Record history
        onRecordRound({
          roundNumber: roundCounter,
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          playerAnswer: playerAnswer,
          oracleAnswer: outcome,
          isWin: isWin,
        });

        // Open celebration/result banner
        setIsBannerOpen(true);
      }, 900);
    }, 2200);
  };

  const handleNextRound = () => {
    setRoundCounter((prev) => prev + 1);
    setIsBannerOpen(false);
    pickNewQuestion();
  };

  const handleReplayCurrentQuestion = () => {
    setIsBannerOpen(false);
    setPlayerAnswer(null);
    setOracleAnswer(null);
    setGamePhase('QUESTION_POP');
    sound.playClick(440);
  };

  const handlePlayImmediately = (newQ: Question) => {
    if (onSelectQuestionId) {
      onSelectQuestionId(newQ.id);
    }
    const idx = questions.findIndex((q) => q.id === newQ.id);
    if (idx !== -1) {
      setCurrentQuestionIndex(idx);
    }
    setPlayerAnswer(null);
    setOracleAnswer(null);
    setGamePhase('QUESTION_POP');
    setIsBannerOpen(false);
  };

  const isWin = playerAnswer !== null && oracleAnswer !== null && playerAnswer === oracleAnswer;

  return (
    <div className="flex-1 flex flex-col justify-between w-full h-full min-h-0 overflow-hidden">
      {/* Top Arena Info Bar (First Row with Meta, YES/NO buttons, and controls) */}
      <div className="px-2 sm:px-3 py-1 sm:py-1.5 border-b-2 sm:border-b-[3px] border-black flex flex-row items-center justify-between gap-1 sm:gap-2 bg-white shrink-0 select-none">
        {/* Left: Round & Meta */}
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
          <span className="w-2 h-2 bg-black inline-block shrink-0" />
          <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-tight whitespace-nowrap">
            R#{roundCounter}
          </span>
          {currentQuestion.category && (
            <span className="font-mono text-[8px] sm:text-[9px] font-bold border border-black px-1 py-0.2 uppercase bg-neutral-100 truncate max-w-[70px] sm:max-w-[100px] hidden xs:inline-block">
              {currentQuestion.category}
            </span>
          )}
          {currentStreak > 0 && (
            <div
              id="streak-badge"
              className="flex items-center gap-0.5 bg-black text-white px-1 py-0.2 text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-wider border border-black shrink-0"
            >
              <Trophy className="w-2.5 h-2.5" />
              <span>{currentStreak}W</span>
            </div>
          )}
        </div>

        {/* Center: YES and NO Buttons on the first row */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id="player-choose-yes-btn"
            type="button"
            disabled={gamePhase === 'ORACLE_PULSING' || gamePhase === 'ANSWER_REVEAL'}
            onClick={() => handleSelectAnswer('YES')}
            className={`px-3 py-1 font-mono text-xs font-black uppercase tracking-wider border border-black transition-all ${
              playerAnswer === 'YES'
                ? 'bg-black text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]'
                : 'bg-white text-black hover:bg-neutral-100'
            } disabled:cursor-not-allowed active:scale-95`}
          >
            <div className="flex items-center gap-1">
              <span>YES</span>
              {playerAnswer === 'YES' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>

          <button
            id="player-choose-no-btn"
            type="button"
            disabled={gamePhase === 'ORACLE_PULSING' || gamePhase === 'ANSWER_REVEAL'}
            onClick={() => handleSelectAnswer('NO')}
            className={`px-3 py-1 font-mono text-xs font-black uppercase tracking-wider border border-black transition-all ${
              playerAnswer === 'NO'
                ? 'bg-black text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]'
                : 'bg-white text-black hover:bg-neutral-100'
            } disabled:cursor-not-allowed active:scale-95`}
          >
            <div className="flex items-center gap-1">
              <span>NO</span>
              {playerAnswer === 'NO' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>
        </div>

        {/* Right: Write & Shuffle */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id="arena-write-question-btn"
            type="button"
            onClick={() => {
              setCreatorInitialMode('WRITE');
              setIsCreatorOpen(true);
              sound.playClick(440);
            }}
            className="p-1 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider border border-black bg-white hover:bg-neutral-100 flex items-center gap-1 transition-transform active:scale-95"
            title="Write and store a question"
          >
            <PenTool className="w-3 h-3" />
            <span className="hidden md:inline">Write</span>
          </button>

          <button
            id="draw-random-question-btn"
            type="button"
            onClick={pickNewQuestion}
            disabled={gamePhase === 'ORACLE_PULSING' || gamePhase === 'ANSWER_REVEAL'}
            className="p-1 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider border border-black bg-white hover:bg-neutral-100 disabled:opacity-40 flex items-center gap-1 transition-transform active:scale-95"
            title="Draw random question"
          >
            <Shuffle className="w-3 h-3" />
            <span className="hidden md:inline">Shuffle</span>
          </button>
        </div>
      </div>

      {/* Center Stage: Scooted up (Active Question, Mandala, and History) */}
      <div className="flex-1 flex flex-col items-center justify-start p-1.5 sm:p-2 text-center bg-white min-h-0 overflow-y-auto overflow-x-hidden gap-1 sm:gap-2">
        {/* Active Question Display */}
        <div className="max-w-4xl w-full px-2 shrink-0">
          <span className="text-[8px] sm:text-[10px] font-mono font-black opacity-50 uppercase tracking-[0.25em] block mb-0.5">
            ACTIVE QUESTION
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id + currentQuestion.text}
              initial={{ opacity: 0, x: [-4, 4, -2, 2, 0], skewX: [0, -4, 4, -1, 0] }}
              animate={{ opacity: 1, x: 0, skewX: 0 }}
              transition={{ duration: 0.3 }}
              id="popped-question-container"
              className="px-0.5"
            >
              <h1
                id="current-question-text"
                className="text-xl xs:text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1.05] text-black font-mono line-clamp-3 select-text"
              >
                "{currentQuestion.text}"
              </h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pulsing Orb / Mandala (Moved over just a small bit & prompting flash) */}
        <div className="w-full my-0.5 sm:my-1 flex items-center justify-center shrink-0 translate-x-1 sm:translate-x-2">
          <PulsingOrb
            isPulsing={gamePhase === 'ORACLE_PULSING'}
            oracleAnswer={oracleAnswer}
            showAnswer={gamePhase === 'ANSWER_REVEAL' || gamePhase === 'RESULT_CELEBRATE'}
            isPrompting={playerAnswer !== null}
            onClick={() => {
              if (!playerAnswer || gamePhase === 'ORACLE_PULSING' || gamePhase === 'ANSWER_REVEAL') {
                sound.playClick(300);
                return;
              }
              handleConsultOracle();
            }}
          />
        </div>

        {/* Linear Line of Yes and No History Squares closely underneath the mandala */}
        <div
          id="oracle-history-linear-strip"
          className="w-full max-w-xl pt-1 mt-1 border-t-2 border-black/10 shrink-0"
        >
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500 mb-1 px-0.5">
            <span className="flex items-center gap-1 text-black">
              <span className="w-1.5 h-1.5 bg-black inline-block shrink-0" />
              12-ROUND HISTORY TAPE
            </span>
            <span>
              {recentRounds.length === 0
                ? '0/12 ROUNDS'
                : `${recentRounds.length}/12 • ${recentRounds.filter((r) => r.isWin).length} WINS`}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-1.5 py-0.5 px-0.5">
            {Array.from({ length: 12 }).map((_, index) => {
              const round = recentRounds[index];

              if (!round) {
                return (
                  <div
                    key={`empty-slot-${index}`}
                    id={`history-empty-slot-${index}`}
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 border border-dashed border-neutral-300 bg-neutral-50 text-neutral-300 flex flex-col items-center justify-center font-mono text-[7px] sm:text-[8px] font-bold shrink-0 select-none"
                    title={`Slot #${index + 1} (Empty)`}
                  >
                    <span>{index + 1}</span>
                  </div>
                );
              }

              const isYes = round.oracleAnswer === 'YES';
              return (
                <div
                  key={round.id || `history-round-${index}`}
                  id={`history-slot-${index}`}
                  className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 border border-black flex flex-col items-center justify-center font-mono shrink-0 transition-transform hover:scale-110 cursor-pointer relative select-none shadow-[1px_1px_0px_0px_#000000] ${
                    isYes ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                  title={`Round #${round.roundNumber}: Oracle gave "${round.oracleAnswer}" | You picked "${round.playerAnswer}" (${round.isWin ? 'WIN' : 'MISS'})\nQuestion: "${round.questionText}"`}
                  onClick={() => sound.playClick(isYes ? 600 : 400)}
                >
                  <span className="text-[7px] sm:text-[9px] font-black tracking-tighter leading-none">
                    {round.oracleAnswer}
                  </span>
                  {/* Win indicator dot */}
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      round.isWin
                        ? isYes
                          ? 'bg-white'
                          : 'bg-black'
                        : isYes
                        ? 'bg-neutral-600'
                        : 'bg-neutral-300'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Brutalist Footer Bar right under the history tape */}
        <footer className="w-full max-w-xl border-t-2 border-black/20 bg-white px-2 py-1 text-center text-[9px] sm:text-[10px] font-black text-black uppercase tracking-wider select-none shrink-0 mt-2">
          <div className="flex flex-row items-center justify-between gap-1.5">
            <span className="flex items-center gap-1 text-left truncate">
              <span className="inline-block w-1.5 h-1.5 bg-black animate-ping shrink-0" />
              <span className="truncate">YES/NO ORACLE</span>
            </span>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-right">
              <span>WINS: {stats.totalWins}/{stats.totalRounds}</span>
              <span>STREAK: {stats.currentStreak}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Winner Celebration Modal */}
      <WinnerBanner
        isOpen={isBannerOpen}
        isWin={Boolean(isWin)}
        playerAnswer={playerAnswer}
        oracleAnswer={oracleAnswer}
        questionText={currentQuestion.text}
        onNextRound={handleNextRound}
        onReplayQuestion={handleReplayCurrentQuestion}
        currentStreak={currentStreak}
      />

      {/* Question Creator / AI Generator Modal */}
      <QuestionCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onStoreQuestion={onStoreQuestion}
        onStoreMultipleQuestions={onStoreMultipleQuestions}
        onPlayQuestionImmediately={handlePlayImmediately}
        initialMode={creatorInitialMode}
      />
    </div>
  );
};
