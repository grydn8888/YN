import { GeneratedQuestionItem } from '../types';

export interface GenerateParams {
  topic?: string;
  category?: string;
  count?: number;
}

export interface GenerateResponse {
  questions: GeneratedQuestionItem[];
  source: 'gemini' | 'fallback';
  error?: string;
}

const LOCAL_FALLBACKS: GeneratedQuestionItem[] = [
  { text: 'Will taking a daring risk today unlock an unexpected door?', category: 'Predictions' },
  { text: 'Is your first instinct on this decision the right one?', category: 'Daily Decisions' },
  { text: 'Can a simple change in perspective alter your destiny?', category: 'Philosophical' },
  { text: 'Will a long-forgotten conversation prove important this month?', category: 'Mysteries' },
  { text: 'Should you say yes to the very next opportunity offered?', category: 'Daily Decisions' },
  { text: 'Is there a hidden lesson in your most recent mistake?', category: 'Philosophical' },
  { text: 'Will tomorrow be more productive than today?', category: 'Predictions' },
  { text: 'Should you trust your heart over your analytical mind?', category: 'Opinions' },
];

export async function generateAIQuestions(params: GenerateParams = {}): Promise<GenerateResponse> {
  const { topic = 'General Decisions', category = 'Predictions', count = 5 } = params;

  try {
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        category,
        count,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data: GenerateResponse = await response.json();
    if (data && Array.isArray(data.questions) && data.questions.length > 0) {
      return data;
    }
    throw new Error('No questions returned');
  } catch (err: any) {
    console.warn('AI generation error, using fallback pool:', err);
    // Shuffle and pick fallback questions
    const shuffled = [...LOCAL_FALLBACKS]
      .sort(() => 0.5 - Math.random())
      .slice(0, count || 5);

    return {
      questions: shuffled,
      source: 'fallback',
      error: err?.message,
    };
  }
}
