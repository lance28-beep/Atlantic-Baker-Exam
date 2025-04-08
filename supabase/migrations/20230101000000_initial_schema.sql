-- Create tables for our exam system

-- Examiners table (extends auth.users)
CREATE TABLE examiners (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  age INT,
  date_deployed DATE,
  designation TEXT,
  store_area TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Admins table (extends auth.users)
CREATE TABLE admins (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_type TEXT NOT NULL,
  question_type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Exam attempts table
CREATE TABLE exam_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL,
  score INT,
  total_questions INT,
  answers JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken INT -- in seconds
);

-- Create RLS policies

-- Examiners policies
ALTER TABLE examiners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiners can view their own profile"
  ON examiners FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all examiner profiles"
  ON examiners FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Questions policies
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiners can view questions"
  ON questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM examiners WHERE id = auth.uid()));

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Exam attempts policies
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiners can view their own attempts"
  ON exam_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Examiners can insert their own attempts"
  ON exam_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Examiners can update their own attempts"
  ON exam_attempts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all exam attempts"
  ON exam_attempts FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));
