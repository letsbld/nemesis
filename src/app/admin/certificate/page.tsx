'use client';

import { useState, useCallback } from 'react';
import { CertificateAuthForms } from '@/components/user/certificate-auth';
import { CertificateQuiz } from '@/components/user/certificate-quiz';
import { CertificateResults } from '@/components/user/certificate-results';
import { Toast } from '@/components/ui/toast';
import { employeeService, quizService, answerService } from '@/lib/certificate-service';
import { generateCertificateNumber, generateQRCode, generateCertificateHTML, openCertificate } from '@/lib/certificate-utils';
import type { QuizState, AuthMode, EmployeeInfo, AnswerSubmission } from '@/types/user.types';

export default function CertificatePage() {
  const [state, setState] = useState<QuizState>({
    currentScreen: 'start',
    authMode: 'login',
    employeeInfo: null,
    quizSessionId: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    results: null,
    isLoading: false,
    error: null,
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [progressData, setProgressData] = useState<any[]>([]);

  const showMessage = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  // Handle login
  const handleLogin = async (employeeId: string) => {
    if (!employeeId) {
      showMessage('Please enter your Employee ID', 'error');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      showMessage('Logging in and generating quiz...', 'success');
      
      // Get employee details
      const employeeResponse = await employeeService.getById(employeeId);
      const employeeInfo: EmployeeInfo = {
        employee_id: employeeResponse.employee.employee_id,
        first_name: employeeResponse.employee.first_name,
        last_name: employeeResponse.employee.last_name,
        email: employeeResponse.employee.email,
        department: employeeResponse.employee.department,
        position: employeeResponse.employee.position,
      };

      // Generate quiz
      const quizResponse = await quizService.generate({
        topic: 'Cybersecurity Awareness',
        meta: ['Phishing', 'Social Engineering', 'Password Security'],
        employee_id: employeeId,
      });

      // Load quiz questions
      const quizData = await quizService.getById(quizResponse.quiz_session_id);

      setState(prev => ({
        ...prev,
        employeeInfo,
        quizSessionId: quizResponse.quiz_session_id,
        questions: quizData.questions,
        currentScreen: 'quiz',
        isLoading: false,
      }));

      showMessage('Quiz loaded successfully!', 'success');
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      showMessage(error.message || 'Failed to login', 'error');
    }
  };

  // Handle registration
  const handleRegister = async (formData: {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
    position: string;
  }) => {
    // Validate required fields
    if (!formData.employee_id || !formData.first_name || !formData.last_name || !formData.email || !formData.department) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      showMessage('Registering employee and generating quiz...', 'success');

      // Register employee (ignore 409 conflict - employee already exists)
      try {
        await employeeService.register(formData);
      } catch (error: any) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }

      const employeeInfo: EmployeeInfo = {
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
      };

      // Generate quiz
      const quizResponse = await quizService.generate({
        topic: 'Cybersecurity Awareness',
        meta: ['Phishing', 'Social Engineering', 'Password Security'],
        employee_id: formData.employee_id,
      });

      // Load quiz questions
      const quizData = await quizService.getById(quizResponse.quiz_session_id);

      setState(prev => ({
        ...prev,
        employeeInfo,
        quizSessionId: quizResponse.quiz_session_id,
        questions: quizData.questions,
        currentScreen: 'quiz',
        isLoading: false,
      }));

      showMessage('Registration successful! Quiz loaded.', 'success');
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      showMessage(error.message || 'Failed to register', 'error');
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    setState(prev => {
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentQuestionIndex] = answerIndex;
      return { ...prev, answers: newAnswers };
    });
  };

  // Handle next question
  const handleNextQuestion = async () => {
    // Check if answer is selected
    if (state.answers[state.currentQuestionIndex] === undefined) {
      showMessage('Please select an answer before proceeding', 'error');
      return;
    }

    // If not last question, move to next
    if (state.currentQuestionIndex < state.questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      // Last question - submit answers
      await handleSubmitQuiz();
    }
  };

  // Handle quiz submission
  const handleSubmitQuiz = async () => {
    if (!state.quizSessionId || !state.employeeInfo) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const answerSubmissions: AnswerSubmission[] = state.answers.map((answerIndex, questionIndex) => ({
        question_id: state.questions[questionIndex].id,
        selected_answer: answerIndex!,
      }));

      const results = await answerService.submit({
        quiz_session_id: state.quizSessionId,
        employee_id: state.employeeInfo.employee_id,
        answers: answerSubmissions,
      });

      // Fetch progress data
      try {
        const progressResponse = await employeeService.getProgress(state.employeeInfo.employee_id);
        setProgressData(progressResponse.progress);
      } catch (error) {
        console.warn('Could not fetch progress data');
      }

      setState(prev => ({
        ...prev,
        results,
        currentScreen: 'results',
        isLoading: false,
      }));

      showMessage(results.is_passed ? 'Congratulations! You passed!' : 'Quiz completed', 'success');
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      showMessage(error.message || 'Failed to submit quiz', 'error');
    }
  };

  // Handle certificate generation
  const handleGenerateCertificate = async () => {
    if (!state.employeeInfo || !state.results) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      showMessage('Generating certificate with QR code...', 'success');

      const certificateNumber = generateCertificateNumber();
      
      // Generate QR code data
      const qrData = `CERTIFICATE VERIFICATION
        Certificate: ${certificateNumber}
        Employee: ${state.employeeInfo.first_name} ${state.employeeInfo.last_name}
        Employee ID: ${state.employeeInfo.employee_id}
        Completed: ${new Date().toLocaleDateString()}
        Issued by: Security Training Portal

        This certificate has been verified and is authentic.`;

      const qrCodeDataURL = await generateQRCode(qrData);

      const certificateHTML = generateCertificateHTML({
        certificateNumber,
        employeeInfo: state.employeeInfo,
        score: state.results.score,
        totalQuestions: state.results.total_questions,
        percentage: state.results.percentage,
        completedDate: new Date(),
        qrCodeDataURL,
      });

      const certificateWindow = openCertificate(certificateHTML);

      if (!certificateWindow) {
        showMessage('Please allow pop-ups for this site to generate certificates', 'error');
      } else {
        showMessage('Certificate generated successfully!', 'success');
      }

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      showMessage(error.message || 'Failed to generate certificate', 'error');
    }
  };

  // Handle retake quiz
  const handleRetakeQuiz = () => {
    setState({
      currentScreen: 'start',
      authMode: 'login',
      employeeInfo: null,
      quizSessionId: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      results: null,
      isLoading: false,
      error: null,
    });
    setProgressData([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl p-8 text-center shadow-xl">
          <h1 className="text-4xl font-bold mb-2">🛡️ Security Training Certificate</h1>
          <p className="text-lg opacity-90">Cybersecurity Awareness Training & Assessment</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-2xl shadow-2xl p-8 md:p-12">
          {state.currentScreen === 'start' && (
            <CertificateAuthForms
              authMode={state.authMode}
              onModeChange={(mode: AuthMode) => setState(prev => ({ ...prev, authMode: mode }))}
              onLogin={handleLogin}
              onRegister={handleRegister}
              isLoading={state.isLoading}
            />
          )}

          {state.currentScreen === 'quiz' && (
            <CertificateQuiz
              questions={state.questions}
              currentQuestionIndex={state.currentQuestionIndex}
              selectedAnswer={state.answers[state.currentQuestionIndex]}
              onAnswerSelect={handleAnswerSelect}
              onNext={handleNextQuestion}
              isLoading={state.isLoading}
            />
          )}

          {state.currentScreen === 'results' && state.results && state.employeeInfo && (
            <CertificateResults
              results={state.results}
              employeeInfo={state.employeeInfo}
              progressData={progressData}
              onGenerateCertificate={handleGenerateCertificate}
              onRetakeQuiz={handleRetakeQuiz}
              isLoading={state.isLoading}
            />
          )}
        </div>
      </div>

      {message && (
        <Toast
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
    </div>
  );
}
