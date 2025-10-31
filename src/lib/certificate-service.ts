import { apiFetch } from './apiFetch';
import type {
  EmployeeRegistrationData,
  EmployeeResponse,
  QuizGenerateRequest,
  QuizGenerateResponse,
  QuizResponse,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
  ProgressResponse,
} from '@/types/user.types';


/**
 * Employee API Services
 */
export const employeeService = {
  async register(data: EmployeeRegistrationData): Promise<{ message: string }> {
    const response = await apiFetch(`/security-training/employee/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok && response.status !== 409) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register employee');
    }

    return response.json();
  },

  async getById(employeeId: string): Promise<EmployeeResponse> {
    const response = await apiFetch(`/security-training/employee/${employeeId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Employee not found');
    }

    return response.json();
  },

  async getProgress(employeeId: string): Promise<ProgressResponse> {
    const response = await apiFetch(`/security-training/employee/${employeeId}/progress`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch progress');
    }

    return response.json();
  },
};

/**
 * Quiz API Services
 */
export const quizService = {
  async generate(data: QuizGenerateRequest): Promise<QuizGenerateResponse> {
    const response = await apiFetch(`/security-training/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate quiz');
    }

    return response.json();
  },

  async getById(quizSessionId: string): Promise<QuizResponse> {
    const response = await apiFetch(`/security-training/quiz/${quizSessionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to load quiz');
    }

    return response.json();
  },
};

/**
 * Answer Submission API Services
 */
export const answerService = {
  async submit(data: SubmitAnswersRequest): Promise<SubmitAnswersResponse> {
    const response = await apiFetch(`/security-training/answer/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit answers');
    }

    return response.json();
  },
};
