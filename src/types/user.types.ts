export interface UserData {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  display_name: string;
  company_email: string;
  alternate_email: string;
  manager_id: string;
  username: string;
  department: string | null;
  description: string | null;
  totp_secret: string;
  totp_enabled: boolean;
  ssh_key_allowed: boolean;
  role: "user" | "admin"; // 👈 if roles are fixed
  created_at: string; // can be Date if you parse it
  updated_at: string;
  manager_email: string;
  designation: string | null;
  phone: string | null;
  dob: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postcode: string | null;
  profileImage: string; // URL to profile image
  coverImage: string;   // URL to cover image
}

// Certificate/Training related types
export interface EmployeeInfo {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position?: string;
}

export interface EmployeeRegistrationData extends EmployeeInfo {}

export interface EmployeeResponse {
  employee: EmployeeInfo & {
    total_modules?: number;
    completed_modules?: number;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer?: number;
}

export interface QuizGenerateRequest {
  topic: string;
  meta: string[];
  employee_id: string;
}

export interface QuizGenerateResponse {
  quiz_session_id: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

export interface AnswerSubmission {
  question_id: string;
  selected_answer: number;
}

export interface SubmitAnswersRequest {
  quiz_session_id: string;
  employee_id: string;
  answers: AnswerSubmission[];
}

export interface SubmitAnswersResponse {
  score: number;
  total_questions: number;
  percentage: number;
  is_passed: boolean;
}

export interface ProgressItem {
  module_name?: string;
  is_completed: boolean;
  completed_at?: string;
}

export interface ProgressResponse {
  progress: ProgressItem[];
}

export interface CertificateData {
  certificateNumber: string;
  employeeInfo: EmployeeInfo;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedDate: Date;
  qrCodeDataURL: string;
}

export type ViewScreen = 'start' | 'quiz' | 'results';
export type AuthMode = 'login' | 'register';

export interface QuizState {
  currentScreen: ViewScreen;
  authMode: AuthMode;
  employeeInfo: EmployeeInfo | null;
  quizSessionId: string | null;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: (number | undefined)[];
  results: SubmitAnswersResponse | null;
  isLoading: boolean;
  error: string | null;
}