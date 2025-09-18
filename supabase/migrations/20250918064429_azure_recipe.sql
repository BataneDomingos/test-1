-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false')),
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  time_limit INTEGER DEFAULT 30,
  image_url TEXT,
  video_url TEXT,
  points INTEGER DEFAULT 100
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  pin TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  current_question INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create player_sessions table
CREATE TABLE IF NOT EXISTS player_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  answers JSONB DEFAULT '[]',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_session_id, player_name)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for quizzes
CREATE POLICY "Teachers can manage their own quizzes" ON quizzes
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Students can read quizzes for active games" ON quizzes
  FOR SELECT USING (
    id IN (
      SELECT quiz_id FROM game_sessions WHERE status IN ('waiting', 'active')
    )
  );

-- RLS Policies for questions
CREATE POLICY "Teachers can manage questions for their quizzes" ON questions
  FOR ALL USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Students can read questions for active games" ON questions
  FOR SELECT USING (
    quiz_id IN (
      SELECT quiz_id FROM game_sessions WHERE status IN ('waiting', 'active')
    )
  );

-- RLS Policies for game_sessions
CREATE POLICY "Teachers can manage their own game sessions" ON game_sessions
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Players can read active game sessions" ON game_sessions
  FOR SELECT USING (status IN ('waiting', 'active'));

-- RLS Policies for player_sessions
CREATE POLICY "Players can manage their own sessions" ON player_sessions
  FOR ALL USING (
    game_session_id IN (
      SELECT id FROM game_sessions WHERE status IN ('waiting', 'active')
    )
  );

CREATE POLICY "Teachers can read player sessions for their games" ON player_sessions
  FOR SELECT USING (
    game_session_id IN (
      SELECT id FROM game_sessions WHERE created_by = auth.uid()
    )
  );