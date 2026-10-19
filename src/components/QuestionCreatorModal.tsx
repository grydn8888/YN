import React, { useState } from 'react';
import { 
  X, 
  PenTool, 
  Sparkles, 
  Check, 
  Plus, 
  Loader2, 
  ArrowRight,
  BookmarkPlus,
  Play
} from 'lucide-react';
import { Question, GeneratedQuestionItem } from '../types';
import { generateAIQuestions } from '../utils/aiGenerator';
import { sound } from '../utils/sound';

interface QuestionCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => Question;
  onStoreMultipleQuestions?: (questions: Array<Omit<Question, 'id' | 'createdAt'>>) => void;
  onPlayQuestionImmediately?: (question: Question) => void;
  initialMode?: 'WRITE' | 'GENERATE';
}

const TOPIC_CHIPS = [
  'Life Choices',
  'Mysteries & Destiny',
  'Deep Philosophy',
  'Future & Sci-Fi',
  'Career & Work',
  'Absurd Dilemmas',
  'Daily Routine',
];

const CATEGORY_OPTIONS = [
  'Daily Decisions',
  'Predictions',
  'Philosophical',
  'Mysteries',
  'Debates',
  'Opinions',
  'Custom',
];

export const QuestionCreatorModal: React.FC<QuestionCreatorModalProps> = ({
  isOpen,
  onClose,
  onStoreQuestion,
  onStoreMultipleQuestions,
  onPlayQuestionImmediately,
  initialMode = 'WRITE',
}) => {
  const [activeMode, setActiveMode] = useState<'WRITE' | 'GENERATE'>(initialMode);

  // Write state
  const [writeText, setWriteText] = useState('');
  const [writeCategory, setWriteCategory] = useState('Daily Decisions');
  const [customCategory, setCustomCategory] = useState('');

  // Generate state
  const [topicPrompt, setTopicPrompt] = useState('');
  const [generateCategory, setGenerateCategory] = useState('Predictions');
  const [generateCount, setGenerateCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState<GeneratedQuestionItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [storedNotice, setStoredNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const finalWriteCategory = writeCategory === 'Custom' 
    ? (customCategory.trim() || 'Custom') 
    : writeCategory;

  const handleWriteSubmit = (e: React.FormEvent, playNow: boolean = false) => {
    e.preventDefault();
    const cleanText = writeText.trim();
    if (!cleanText) return;

    // Ensure ending with question mark
    const formatted = cleanText.endsWith('?') ? cleanText : `${cleanText}?`;

    const stored = onStoreQuestion({
      text: formatted,
      category: finalWriteCategory,
      timesPlayed: 0,
      timesWon: 0,
      source: 'written',
    });

    sound.playClick(600);
    setStoredNotice(`Question saved and stored to database!`);

    if (playNow && onPlayQuestionImmediately) {
      setTimeout(() => {
        onPlayQuestionImmediately(stored);
        onClose();
      }, 300);
    } else {
      setTimeout(() => {
        setWriteText('');
        setStoredNotice(null);
        onClose();
      }, 600);
    }
  };

  const handleTriggerGenerate = async () => {
    setIsGenerating(true);
    setStoredNotice(null);
    sound.playClick(440);

    const result = await generateAIQuestions({
      topic: topicPrompt.trim() || 'Exciting Yes/No Oracle decisions and mysteries',
      category: generateCategory,
      count: generateCount,
    });

    setIsGenerating(false);
    setGeneratedList(result.questions);
    // Select all by default
    setSelectedIndices(new Set(result.questions.map((_, i) => i)));
    sound.playClick(result.source === 'gemini' ? 700 : 500);
  };

  const handleToggleSelectIndex = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedIndices(next);
    sound.playClick(350);
  };

  const handleSaveSelectedGenerated = () => {
    if (selectedIndices.size === 0) return;
    const toSave = Array.from(selectedIndices).map((idx) => {
      const item = generatedList[idx];
      return {
        text: item.text,
        category: item.category || generateCategory || 'AI Generated',
        timesPlayed: 0,
        timesWon: 0,
        source: 'generated' as const,
      };
    });

    if (onStoreMultipleQuestions) {
      onStoreMultipleQuestions(toSave);
    } else {
      toSave.forEach((q) => onStoreQuestion(q));
    }

    sound.playClick(650);
    setStoredNotice(`Stored ${toSave.length} generated questions to repository!`);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handlePlaySingleGenerated = (item: GeneratedQuestionItem) => {
    const stored = onStoreQuestion({
      text: item.text,
      category: item.category || generateCategory || 'AI Generated',
      timesPlayed: 0,
      timesWon: 0,
      source: 'generated',
    });

    sound.playClick(600);
    if (onPlayQuestionImmediately) {
      onPlayQuestionImmediately(stored);
      onClose();
    }
  };

  return (
    <div 
      id="question-creator-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        id="question-creator-modal"
        className="w-full max-w-2xl max-h-[92vh] bg-white border-[4px] sm:border-[6px] md:border-[8px] border-black shadow-[6px_6px_0px_0px_#000000] sm:shadow-[12px_12px_0px_0px_#000000] flex flex-col font-mono overflow-hidden"
      >
        {/* Modal Top Bar */}
        <div className="bg-black text-white p-3 sm:p-4 flex items-center justify-between border-b-[3px] sm:border-b-[4px] border-black">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white text-black flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
              +
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-black uppercase tracking-wider truncate">
                WRITE & GENERATE
              </h2>
              <p className="text-[8px] sm:text-[10px] text-neutral-300 uppercase tracking-widest truncate">
                Stored in local repository
              </p>
            </div>
          </div>

          <button
            id="close-creator-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1 sm:p-1.5 bg-transparent hover:bg-neutral-800 text-white border border-white sm:border-2 transition-all active:scale-95 shrink-0"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Tab Switcher: WRITE vs GENERATE */}
        <div className="flex border-b-[3px] sm:border-b-[4px] border-black bg-neutral-100 shrink-0">
          <button
            id="modal-tab-write"
            type="button"
            onClick={() => {
              setActiveMode('WRITE');
              sound.playClick(440);
            }}
            className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-all ${
              activeMode === 'WRITE'
                ? 'bg-white text-black border-b-2 sm:border-b-4 border-black font-black'
                : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>1. Write</span>
          </button>

          <button
            id="modal-tab-generate"
            type="button"
            onClick={() => {
              setActiveMode('GENERATE');
              sound.playClick(440);
            }}
            className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-all ${
              activeMode === 'GENERATE'
                ? 'bg-white text-black border-b-2 sm:border-b-4 border-black font-black'
                : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Gemini AI</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto space-y-3 sm:space-y-5">
          {storedNotice && (
            <div className="p-3 bg-black text-white border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{storedNotice}</span>
            </div>
          )}

          {/* MODE 1: WRITE QUESTION */}
          {activeMode === 'WRITE' && (
            <form onSubmit={(e) => handleWriteSubmit(e, false)} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Question Text (Yes / No format) *
                </label>
                <textarea
                  id="custom-question-textarea"
                  value={writeText}
                  onChange={(e) => setWriteText(e.target.value)}
                  placeholder="e.g., Should I launch my new venture this week?"
                  rows={3}
                  className="w-full p-3.5 border-3 border-black text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
                  autoFocus
                  required
                />
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mt-1">
                  Must be phrased for a definite YES or NO decision.
                </span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Category Tag
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setWriteCategory(cat);
                        sound.playClick(350);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold uppercase border-2 border-black transition-colors ${
                        writeCategory === cat
                          ? 'bg-black text-white'
                          : 'bg-white hover:bg-neutral-100 text-black'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {writeCategory === 'Custom' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name..."
                    className="w-full p-2.5 border-2 border-black text-xs font-bold mt-2"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t-2 border-black flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white border-2 border-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-100"
                >
                  Cancel
                </button>

                <button
                  id="write-save-and-store-btn"
                  type="submit"
                  disabled={!writeText.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black text-xs font-black uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Save to Storage</span>
                </button>

                {onPlayQuestionImmediately && (
                  <button
                    id="write-save-and-play-btn"
                    type="button"
                    disabled={!writeText.trim()}
                    onClick={(e) => handleWriteSubmit(e, true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-black hover:bg-neutral-800 text-white border-2 border-black text-xs font-black uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Save & Play Now</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* MODE 2: GENERATE QUESTIONS WITH GEMINI */}
          {activeMode === 'GENERATE' && (
            <div className="space-y-5">
              {/* Generation Controls Box */}
              <div className="p-4 border-[3px] border-black bg-neutral-50 space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1">
                    Theme / Prompt / Focus (Optional)
                  </label>
                  <input
                    id="generate-topic-input"
                    type="text"
                    value={topicPrompt}
                    onChange={(e) => setTopicPrompt(e.target.value)}
                    placeholder="e.g., Tough moral dilemmas, Space mysteries, Daily food & travel..."
                    className="w-full p-2.5 border-2 border-black text-xs font-bold focus:outline-none bg-white"
                  />
                </div>

                {/* Quick Topic Prompts */}
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1">
                    Quick Suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPIC_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setTopicPrompt(chip);
                          sound.playClick(350);
                        }}
                        className="text-[11px] bg-white hover:bg-black hover:text-white border border-black px-2 py-0.5 transition-colors font-bold"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category & Count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={generateCategory}
                      onChange={(e) => setGenerateCategory(e.target.value)}
                      className="w-full p-2 border-2 border-black text-xs font-bold bg-white"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1">
                      Count (Questions)
                    </label>
                    <div className="flex items-center gap-2">
                      {[3, 5, 8].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => {
                            setGenerateCount(cnt);
                            sound.playClick(300);
                          }}
                          className={`flex-1 py-1.5 border-2 border-black text-xs font-black ${
                            generateCount === cnt ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2">
                  <button
                    id="trigger-ai-generation-btn"
                    type="button"
                    disabled={isGenerating}
                    onClick={handleTriggerGenerate}
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white border-2 border-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>CONSULTING GEMINI AI ENGINE...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>GENERATE {generateCount} YES/NO QUESTIONS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Results List */}
              {generatedList.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2">
                    <span className="text-xs font-black uppercase tracking-wider">
                      GENERATED ({generatedList.length}) • SELECT TO STORE
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedIndices.size === generatedList.length) {
                          setSelectedIndices(new Set());
                        } else {
                          setSelectedIndices(new Set(generatedList.map((_, i) => i)));
                        }
                        sound.playClick(400);
                      }}
                      className="text-[11px] font-bold uppercase underline"
                    >
                      {selectedIndices.size === generatedList.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {generatedList.map((item, idx) => {
                      const isSelected = selectedIndices.has(idx);
                      return (
                        <div
                          key={idx}
                          className={`p-3 border-2 border-black flex items-start justify-between gap-3 transition-colors ${
                            isSelected ? 'bg-neutral-100' : 'bg-white'
                          }`}
                        >
                          <div 
                            className="flex items-start gap-2.5 flex-1 cursor-pointer select-none"
                            onClick={() => handleToggleSelectIndex(idx)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectIndex(idx)}
                              className="w-4 h-4 mt-0.5 accent-black cursor-pointer"
                            />
                            <div>
                              <span className="text-[10px] uppercase font-bold border border-black px-1.5 py-0.2 bg-white inline-block mb-1">
                                {item.category}
                              </span>
                              <p className="text-xs font-bold text-black leading-snug">
                                {item.text}
                              </p>
                            </div>
                          </div>

                          {onPlayQuestionImmediately && (
                            <button
                              type="button"
                              onClick={() => handlePlaySingleGenerated(item)}
                              className="px-2.5 py-1 bg-black text-white text-[10px] font-black uppercase border border-black hover:bg-neutral-800 shrink-0 flex items-center gap-1"
                              title="Store and play this question immediately"
                            >
                              <span>Play</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Batch Save Action */}
                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-600">
                      {selectedIndices.size} of {generatedList.length} selected
                    </span>

                    <button
                      id="save-selected-generated-btn"
                      type="button"
                      disabled={selectedIndices.size === 0}
                      onClick={handleSaveSelectedGenerated}
                      className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-2 disabled:opacity-40 shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>STORE SELECTED ({selectedIndices.size}) TO DATABASE</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
