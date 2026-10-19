import { useState, useEffect } from 'react';
import { 
  loadStoredQuestions, 
  saveStoredQuestions, 
  loadStoredHistory, 
  saveStoredHistory, 
  loadStoredStats, 
  saveStoredStats,
  loadSoundMuted,
  saveSoundMuted,
  GameStats
} from './utils/storage';
import { Question, RoundRecord, ActiveTab } from './types';
import { Navigation } from './components/Navigation';
import { OracleArena } from './components/OracleArena';
import { QuestionDatabase } from './components/QuestionDatabase';
import { RoundHistoryView } from './components/RoundHistoryView';
import { sound } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('GAME');
  const [questions, setQuestions] = useState<Question[]>(() => loadStoredQuestions());
  const [history, setHistory] = useState<RoundRecord[]>(() => loadStoredHistory());
  const [stats, setStats] = useState<GameStats>(() => loadStoredStats());
  const [isMuted, setIsMuted] = useState<boolean>(() => loadSoundMuted());
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Initialize sound mute state
  useEffect(() => {
    sound.setMuted(isMuted);
  }, [isMuted]);

  // Sync questions to storage
  const handleSaveQuestions = (updated: Question[]) => {
    setQuestions(updated);
    saveStoredQuestions(updated);
  };

  // Add single question (returns created Question)
  const handleAddQuestion = (newQ: Omit<Question, 'id' | 'createdAt'>): Question => {
    const created: Question = {
      ...newQ,
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      timesPlayed: 0,
      timesWon: 0,
    };
    const updated = [created, ...questions];
    handleSaveQuestions(updated);
    return created;
  };

  // Add multiple questions in batch
  const handleAddMultipleQuestions = (newQuestions: Array<Omit<Question, 'id' | 'createdAt'>>) => {
    const createdList: Question[] = newQuestions.map((nq, idx) => ({
      ...nq,
      id: `q-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now() + idx,
      timesPlayed: 0,
      timesWon: 0,
    }));
    const updated = [...createdList, ...questions];
    handleSaveQuestions(updated);
  };

  // Update question
  const handleUpdateQuestion = (updatedQ: Question) => {
    const updated = questions.map((q) => (q.id === updatedQ.id ? updatedQ : q));
    handleSaveQuestions(updated);
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    handleSaveQuestions(updated);
    if (selectedQuestionId === id) {
      setSelectedQuestionId(null);
    }
  };

  // Reset / replace questions list
  const handleResetQuestions = (newQuestions: Question[]) => {
    handleSaveQuestions(newQuestions);
  };

  // Play a specific question directly
  const handlePlayQuestion = (q: Question) => {
    setSelectedQuestionId(q.id);
    setActiveTab('GAME');
  };

  // Record a completed round
  const handleRecordRound = (roundData: Omit<RoundRecord, 'id' | 'timestamp'>) => {
    const newRecord: RoundRecord = {
      ...roundData,
      id: `round-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };

    // Keep last 12 rounds strictly
    const updatedHistory = [...history, newRecord].slice(-12);
    setHistory(updatedHistory);
    saveStoredHistory(updatedHistory);

    // Update game statistics
    const newStreak = roundData.isWin ? stats.currentStreak + 1 : 0;
    const newBest = Math.max(stats.bestStreak, newStreak);
    const updatedStats: GameStats = {
      totalRounds: stats.totalRounds + 1,
      totalWins: stats.totalWins + (roundData.isWin ? 1 : 0),
      currentStreak: newStreak,
      bestStreak: newBest,
    };
    setStats(updatedStats);
    saveStoredStats(updatedStats);

    // Update question usage
    if (roundData.questionId) {
      const updatedQuestions = questions.map((q) => {
        if (q.id === roundData.questionId) {
          return {
            ...q,
            timesPlayed: (q.timesPlayed || 0) + 1,
            timesWon: (q.timesWon || 0) + (roundData.isWin ? 1 : 0),
          };
        }
        return q;
      });
      handleSaveQuestions(updatedQuestions);
    }
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    saveStoredHistory([]);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.setMuted(nextState);
    saveSoundMuted(nextState);
    if (!nextState) {
      sound.playClick(500);
    }
  };

  return (
    <div className="h-[100dvh] w-full max-w-full overflow-hidden bg-neutral-900 text-black flex flex-col items-center justify-center p-0 sm:p-2 md:p-3 font-mono selection:bg-black selection:text-white">
      {/* Outer Brutalist Frame - Sized for Mobile Viewport & Desktop */}
      <div className="w-full max-w-5xl h-full max-h-full sm:max-h-[96vh] md:max-h-[92vh] bg-white border-0 sm:border-[4px] md:border-[8px] border-black flex flex-col overflow-hidden sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
        {/* Top Header & Navigation - Single Line */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          questionsCount={questions.length}
          historyCount={history.length}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden min-h-0">
          {activeTab === 'GAME' && (
            <OracleArena
              questions={questions}
              onRecordRound={handleRecordRound}
              recentRounds={history}
              currentStreak={stats.currentStreak}
              stats={stats}
              onNavigateToQuestions={() => setActiveTab('QUESTIONS')}
              onStoreQuestion={handleAddQuestion}
              onStoreMultipleQuestions={handleAddMultipleQuestions}
              selectedQuestionId={selectedQuestionId}
              onSelectQuestionId={setSelectedQuestionId}
            />
          )}

          {activeTab === 'QUESTIONS' && (
            <div className="h-full overflow-y-auto">
              <QuestionDatabase
                questions={questions}
                onAddQuestion={handleAddQuestion}
                onAddMultipleQuestions={handleAddMultipleQuestions}
                onUpdateQuestion={handleUpdateQuestion}
                onDeleteQuestion={handleDeleteQuestion}
                onResetQuestions={handleResetQuestions}
                onBackToGame={() => setActiveTab('GAME')}
                onPlayQuestion={handlePlayQuestion}
              />
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="h-full overflow-y-auto">
              <RoundHistoryView
                history={history}
                onClearHistory={handleClearHistory}
                onBackToGame={() => setActiveTab('GAME')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
