// User types
export type UserRole = "admin" | "examiner"

export interface User {
  id: string
  email: string
  role: UserRole
}

export interface Examiner {
  id: string
  full_name: string
  age: number
  date_deployed: string
  designation: string
  store_area: string
  created_at: string
}

export interface Admin {
  id: string
  role: string
  created_at: string
}

// Question types
export type ExamType = "SAP" | "Management Trainee" | "Sales" | "QC" | "Production"
export type QuestionType = "multiple_choice" | "essay" | "true_false" | "fill_in_blank"

export interface Question {
  id: string
  exam_type: ExamType
  question_type: QuestionType
  question_text: string
  options: any // JSONB in the database
  correct_answer: any // JSONB in the database
  image_url?: string
  created_by: string
  created_at: string
}

// Exam attempt types
export interface ExamAttempt {
  id: string
  user_id: string
  exam_type: ExamType
  score: number
  total_questions: number
  answers: Record<string, any> // JSONB in the database
  started_at: string
  completed_at?: string
  time_taken?: number // in seconds
}

// Form types for validation
export interface LoginFormValues {
  email: string
  password: string
}

export interface SignupFormValues {
  email: string
  password: string
  confirmPassword: string
  full_name: string
  age: number
  date_deployed: string
  designation: string
  store_area: string
}

export interface QuestionFormValues {
  exam_type: ExamType
  question_type: QuestionType
  question_text: string
  options?: string[]
  correct_answer?: string | string[] | boolean
  image_url?: string
}
