import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  RotateCcw, 
  Download, 
  Upload, 
  Database,
  Sparkles,
  Layers,
  ArrowLeft,
  PenTool,
  Play,
  Bot
} from 'lucide-react';
import { Question } from '../types';
import { INITIAL_QUESTIONS } from '../data/defaultQuestions';
import { QuestionCreatorModal } from './QuestionCreatorModal';
import { sound } from '../utils/sound';

interface QuestionDatabaseProps {
  questions: Question[];
  onAddQuestion: (newQuestion: Omit<Question, 'id' | 'createdAt'>) => Question;
  onAddMultipleQuestions?: (questions: Array<Omit<Question, 'id' | 'createdAt'>>) => void;
  onUpdateQuestion: (updated: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onResetQuestions: (questions: Question[]) => void;
  onBackToGame: () => void;
  onPlayQuestion?: (question: Question) => void;
}

const PRESET_SUGGESTIONS = [
  'Is it time for a coffee break?',
  'Will today bring good luck?',
  'Should you try something completely new today?',
  'Can a robot ever write great poetry?',
  'Is honesty always the best policy in gaming?',
  'Will tomorrow be sunny?',
  'Is the glass half full?',
  'Should you read a book tonight?',
];

const CATEGORIES = ['All', 'Predictions', 'Opinions', 'Daily Decisions', 'Mysteries', 'Philosophical', 'Custom'];
const SOURCE_FILTERS = ['All Sources', 'User Written', 'AI Generated', 'Presets'];

export const QuestionDatabase: React.FC<QuestionDatabaseProps> = ({
  questions,
  onAddQuestion,
  onAddMultipleQuestions,
  onUpdateQuestion,
  onDeleteQuestion,
  onResetQuestions,
  onBackToGame,
  onPlayQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All Sources');

  // Creator Modal state
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [creatorModalMode, setCreatorModalMode] = useState<'WRITE' | 'GENERATE'>('WRITE');

  // Edit question state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Filtering
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (q.category || 'Custom') === selectedCategory;
    
    let matchesSource = true;
    if (selectedSource === 'User Written') matchesSource = q.source === 'written';
    else if (selectedSource === 'AI Generated') matchesSource = q.source === 'generated';
    else if (selectedSource === 'Presets') matchesSource = !q.source || q.source === 'preset';

    return matchesSearch && matchesCategory && matchesSource;
  });

  const handleStartEdit = (q: Question) => {
    setEditingId(q.id);
    setEditText(q.text);
    setEditCategory(q.category || 'General');
    sound.playClick(440);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    sound.playClick(300);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    const existing = questions.find((q) => q.id === id);
    if (existing) {
      const formatted = editText.trim().endsWith('?') ? editText.trim() : `${editText.trim()}?`;
      onUpdateQuestion({
        ...existing,
        text: formatted,
        category: editCategory.trim() || 'General',
      });
    }
    setEditingId(null);
    sound.playClick(550);
  };

  const handleDelete = (id: string) => {
    if (questions.length <= 1) {
      alert('You must keep at least 1 question in the Oracle database!');
      return;
    }
    sound.playClick(300);
    onDeleteQuestion(id);
  };

  const handleExportJSON = () => {
    sound.playClick(440);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `oracle_questions_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].text) {
            onResetQuestions(parsed);
            sound.playClick(600);
          } else {
            alert('Invalid question file format.');
          }
        } catch {
          alert('Could not parse JSON file.');
        }
      };
    }
  };

  const handleAddPreset = (text: string) => {
    onAddQuestion({
      text,
      category: 'Quick Add',
      timesPlayed: 0,
      timesWon: 0,
      source: 'preset',
    });
    sound.playClick(520);
  };

  const handleRestoreDefaults = () => {
    if (confirm('Reset database to default question collection?')) {
      onResetQuestions(INITIAL_QUESTIONS);
      sound.playClick(440);
    }
  };

  const handlePlayDirectly = (q: Question) => {
    if (onPlayQuestion) {
      sound.playClick(600);
      onPlayQuestion(q);
    }
  };

  return (
    <div className="flex-1 p-2.5 sm:p-5 md:p-8 flex flex-col gap-4 sm:gap-6 overflow-y-auto font-mono bg-white">
      {/* Header Banner */}
      <div
        id="question-database-header"
        className="bg-black text-white p-3.5 sm:p-5 md:p-6 border-[3px] sm:border-[6px] border-black flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
      >
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />
            <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight">
              QUESTION REPOSITORY
            </h1>
          </div>
          <p className="text-[10px] sm:text-xs text-neutral-300 tracking-wider uppercase">
            Stored database: {questions.length} total questions available for Oracle decisions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            id="back-to-arena-btn"
            type="button"
            onClick={onBackToGame}
            className="px-3 py-2 bg-transparent hover:bg-neutral-800 text-white border-2 border-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Arena</span>
          </button>

          {/* Write Question Modal Trigger */}
          <button
            id="db-write-question-btn"
            type="button"
            onClick={() => {
              setCreatorModalMode('WRITE');
              setIsCreatorModalOpen(true);
              sound.playClick(440);
            }}
            className="px-3.5 py-2 bg-white hover:bg-neutral-200 text-black border-2 border-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Write Question</span>
          </button>

          {/* AI Generator Modal Trigger */}
          <button
            id="db-generate-ai-btn"
            type="button"
            onClick={() => {
              setCreatorModalMode('GENERATE');
              setIsCreatorModalOpen(true);
              sound.playClick(440);
            }}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white border-2 border-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-[2px_2px_0px_0px_#ffffff]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate with AI</span>
          </button>
        </div>
      </div>

      {/* Quick Prompt & Fast AI Bar */}
      <div className="bg-neutral-50 border-[3px] border-black p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-black">
            <Sparkles className="w-4 h-4 text-black" />
            <span>Instant Question Tools</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCreatorModalMode('GENERATE');
                setIsCreatorModalOpen(true);
              }}
              className="text-[11px] font-black uppercase tracking-wider bg-black text-white px-2.5 py-1 border border-black hover:bg-neutral-800 flex items-center gap-1"
            >
              <Bot className="w-3 h-3" />
              <span>Prompt Gemini Model</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_SUGGESTIONS.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="text-left text-xs bg-white hover:bg-black hover:text-white border-2 border-black px-2.5 py-1 transition-colors active:scale-95 font-bold"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Search, Category & Source Filter Controls */}
      <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000000] flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="search-questions-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stored questions..."
              className="w-full pl-9 pr-3 py-2 border-2 border-black text-xs font-bold focus:outline-none"
            />
          </div>

          {/* Source Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {SOURCE_FILTERS.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  setSelectedSource(src);
                  sound.playClick(400);
                }}
                className={`px-2.5 py-1 text-[11px] font-black uppercase whitespace-nowrap border-2 border-black ${
                  selectedSource === src ? 'bg-black text-white' : 'bg-white hover:bg-neutral-100 text-black'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full pb-1 scrollbar-none border-t border-neutral-200 pt-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400 mr-1 shrink-0">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                sound.playClick(400);
              }}
              className={`px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap border border-black ${
                selectedCategory === cat ? 'bg-black text-white' : 'bg-white hover:bg-neutral-100 text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white border-[4px] sm:border-[6px] border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-3 mb-4 gap-2">
          <span className="text-xs font-black uppercase tracking-wider">
            STORED QUESTIONS ({filteredQuestions.length} MATCHING / {questions.length} TOTAL)
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="export-questions-json-btn"
              type="button"
              onClick={handleExportJSON}
              className="text-[11px] font-bold uppercase border-2 border-black px-2 py-1 flex items-center gap-1 hover:bg-neutral-100"
              title="Export database to JSON file"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>

            <label
              id="import-questions-json-label"
              className="text-[11px] font-bold uppercase border-2 border-black px-2 py-1 flex items-center gap-1 hover:bg-neutral-100 cursor-pointer"
              title="Import database from JSON file"
            >
              <Upload className="w-3 h-3" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            <button
              id="reset-default-questions-btn"
              type="button"
              onClick={handleRestoreDefaults}
              className="text-[11px] font-bold uppercase border-2 border-black px-2 py-1 flex items-center gap-1 hover:bg-neutral-100 text-neutral-600"
              title="Restore initial preset questions"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-neutral-300">
            <Layers className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
            <p className="text-xs uppercase font-bold text-neutral-600">
              No matching questions found in stored repository
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedSource('All Sources');
                }}
                className="text-xs underline uppercase font-bold"
              >
                Clear filters
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setCreatorModalMode('GENERATE');
                  setIsCreatorModalOpen(true);
                }}
                className="text-xs font-black uppercase underline"
              >
                Generate with AI
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((q, index) => {
              const isEditing = editingId === q.id;

              return (
                <div
                  key={q.id}
                  id={`question-item-${q.id}`}
                  className="border-2 border-black p-4 bg-neutral-50 hover:bg-white transition-colors"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">
                          Edit Question Text
                        </label>
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 border-2 border-black text-sm focus:outline-none font-bold"
                          autoFocus
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="w-full sm:w-48">
                          <label className="block text-[10px] font-bold uppercase mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full p-1.5 border-2 border-black text-xs focus:outline-none font-bold"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 bg-white border-2 border-black text-xs font-bold uppercase hover:bg-neutral-100 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(q.id)}
                            className="px-3 py-1.5 bg-black text-white border-2 border-black text-xs font-black uppercase hover:bg-neutral-800 flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] text-neutral-400 font-bold">
                            #{index + 1}
                          </span>
                          {q.category && (
                            <span className="text-[10px] uppercase font-bold border-2 border-black px-1.5 py-0.2 bg-white">
                              {q.category}
                            </span>
                          )}
                          {q.source && (
                            <span className={`text-[9px] uppercase font-black px-1.5 py-0.2 border ${
                              q.source === 'generated'
                                ? 'bg-black text-white border-black'
                                : q.source === 'written'
                                ? 'bg-neutral-200 text-black border-black'
                                : 'bg-transparent text-neutral-500 border-neutral-300'
                            }`}>
                              {q.source === 'generated' ? 'AI GENERATED' : q.source === 'written' ? 'WRITTEN' : 'PRESET'}
                            </span>
                          )}
                          {q.timesPlayed !== undefined && q.timesPlayed > 0 && (
                            <span className="text-[9px] font-bold text-neutral-500">
                              Played {q.timesPlayed}x ({q.timesWon || 0}W)
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-sm sm:text-base text-black">
                          {q.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {onPlayQuestion && (
                          <button
                            type="button"
                            onClick={() => handlePlayDirectly(q)}
                            className="px-3 py-1.5 border-2 border-black bg-black text-white hover:bg-neutral-800 text-xs font-black uppercase flex items-center gap-1 transition-transform active:scale-95"
                            title="Play this question immediately in Arena"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Play</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(q)}
                          className="p-2 border-2 border-black bg-white hover:bg-neutral-100 text-black transition-transform active:scale-95"
                          title="Edit question text"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="p-2 border-2 border-black bg-white hover:bg-neutral-100 text-black transition-transform active:scale-95"
                          title="Delete from database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Write & Generate Questions Modal */}
      <QuestionCreatorModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        onStoreQuestion={onAddQuestion}
        onStoreMultipleQuestions={onAddMultipleQuestions}
        onPlayQuestionImmediately={(q) => {
          if (onPlayQuestion) {
            onPlayQuestion(q);
          }
        }}
        initialMode={creatorModalMode}
      />
    </div>
  );
};
