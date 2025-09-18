export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'teacher' | 'student';
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  questions: Question[];
  settings: QuizSettings;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: string[];
  correct_answer: number;
  time_limit: number;
  image_url?: string;
  video_url?: string;
  points: number;
}

export interface QuizSettings {
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_correct_answer: boolean;
  time_limit_per_question: number;
}

export interface GameSession {
  id: string;
  quiz_id: string;
  pin: string;
  status: 'waiting' | 'active' | 'finished';
  current_question: number;
  created_by: string;
  created_at: string;
}

export interface PlayerSession {
  id: string;
  game_session_id: string;
  player_name: string;
  score: number;
  answers: PlayerAnswer[];
  joined_at: string;
}

export interface PlayerAnswer {
  question_id: string;
  selected_answer: number;
  is_correct: boolean;
  points_earned: number;
  response_time: number;
}

export interface GameStats {
  total_players: number;
  average_score: number;
  completion_rate: number;
  question_stats: QuestionStats[];
}

export interface QuestionStats {
  question_id: string;
  question_text: string;
  total_responses: number;
  correct_responses: number;
  average_response_time: number;
  answer_distribution: number[];
}