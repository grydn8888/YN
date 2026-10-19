export type DecisionAnswer = 'YES' | 'NO';

export interface Question {
  id: string;
  text: string;
  category?: string;
  createdAt: number;
  timesPlayed?: number;
  timesWon?: number;
  source?: 'written' | 'generated' | 'preset';
}

export interface GeneratedQuestionItem {
  text: string;
  category: string;
}

export interface RoundRecord {
  id: string;
  roundNumber: number;
  questionId?: string;
  questionText: string;
  playerAnswer: DecisionAnswer;
  oracleAnswer: DecisionAnswer;
  isWin: boolean;
  timestamp: number;
}

export type GamePhase = 
  | 'QUESTION_POP'     // Question just popped up, player choosing YES or NO
  | 'PLAYER_CHOSEN'    // Player picked an answer, ready to trigger Oracle
  | 'ORACLE_PULSING'   // Oracle button pressed, pulsing orb decision graphic in progress
  | 'ANSWER_REVEAL'    // Oracle answer fading in
  | 'RESULT_CELEBRATE';// Result shown, winner banner if matched, loser note if not

export type ActiveTab = 'GAME' | 'QUESTIONS' | 'HISTORY';
