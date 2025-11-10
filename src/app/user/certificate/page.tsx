'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  ChevronRight,
  Trophy,
  RotateCcw,
  FileText,
  Calendar
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface UserCertificate {
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  duration: string;
}

const SECURITY_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the primary purpose of Multi-Factor Authentication (MFA)?",
    options: [
      "To make login faster",
      "To add an additional layer of security beyond passwords",
      "To replace passwords entirely",
      "To track user login times"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Which of the following is considered a strong password practice?",
    options: [
      "Using the same password across multiple accounts",
      "Using personal information like birthdays",
      "Using a mix of uppercase, lowercase, numbers, and special characters",
      "Sharing passwords with team members"
    ],
    correctAnswer: 2
  },
  {
    id: 3,
    question: "What does DLP stand for in cybersecurity?",
    options: [
      "Data Loss Prevention",
      "Digital License Protection",
      "Direct Link Protocol",
      "Device Lock Program"
    ],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "What is the safest way to handle a suspicious email?",
    options: [
      "Click on links to verify authenticity",
      "Forward it to all colleagues to warn them",
      "Report it as phishing and delete it",
      "Reply asking if it's legitimate"
    ],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "What is the purpose of end-to-end encryption?",
    options: [
      "To speed up data transmission",
      "To ensure only sender and receiver can read the message",
      "To compress files for storage",
      "To backup data automatically"
    ],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "How often should you update your passwords for critical accounts?",
    options: [
      "Never, if it's strong enough",
      "Every 5 years",
      "Every 90 days or when a breach is suspected",
      "Only when you forget them"
    ],
    correctAnswer: 2
  },
  {
    id: 7,
    question: "What is a passkey in modern authentication?",
    options: [
      "A very long password",
      "A cryptographic credential stored on your device",
      "A physical key for your computer",
      "A backup password"
    ],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "What should you do if you suspect your account has been compromised?",
    options: [
      "Wait and monitor for suspicious activity",
      "Immediately change password and enable MFA",
      "Delete the account",
      "Continue using it normally"
    ],
    correctAnswer: 1
  },
  {
    id: 9,
    question: "What is the principle of least privilege in security?",
    options: [
      "Giving everyone admin access for convenience",
      "Granting only the minimum access needed to perform a job",
      "Restricting access to only senior management",
      "Removing all access permissions"
    ],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "What is TOTP in the context of authentication?",
    options: [
      "Total Online Transaction Protocol",
      "Time-based One-Time Password",
      "Two-Option Transfer Process",
      "Temporary Offline Password"
    ],
    correctAnswer: 1
  }
];

const CertificatePage = () => {
  const [myCertificate, setMyCertificate] = useState<UserCertificate | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setQuizStartTime(new Date());
    setShowResults(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < SECURITY_QUIZ.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const score = selectedAnswers.reduce((total, answer, index) => {
      return total + (answer === SECURITY_QUIZ[index].correctAnswer ? 1 : 0);
    }, 0);

    const endTime = new Date();
    const duration = quizStartTime
      ? Math.floor((endTime.getTime() - quizStartTime.getTime()) / 1000)
      : 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    const passed = score >= 7; // Passing score is 70%

    if (passed) {
      const newCertificate: UserCertificate = {
        certificateNumber: `CERT-2025-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        issueDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        score: score,
        totalQuestions: SECURITY_QUIZ.length,
        completedAt: new Date().toISOString(),
        duration: `${minutes}m ${seconds}s`
      };
      setMyCertificate(newCertificate);
    }

    setShowResults(true);
  };

  const handleDownloadCertificate = () => {
    if (!myCertificate) return;

    const certificateText = `
SECURITY AWARENESS CERTIFICATE

This is to certify that you have successfully completed
the Security Awareness Training

Score: ${myCertificate.score}/${myCertificate.totalQuestions} (${Math.round((myCertificate.score / myCertificate.totalQuestions) * 100)}%)
Certificate Number: ${myCertificate.certificateNumber}
Issue Date: ${formatDate(myCertificate.issueDate)}
Valid Until: ${formatDate(myCertificate.expiryDate)}
Duration: ${myCertificate.duration}

Issued by: DLP Security Platform
    `.trim();

    const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${myCertificate.certificateNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101828] p-6">
      <div className="max-w-5xl mx-auto">
        {!showQuiz ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Award className="text-yellow-600 dark:text-yellow-400" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Certificate</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Earn your security awareness certification
                  </p>
                </div>
              </div>

              {myCertificate ? (
                /* Show Certificate */
                <div className="border-2 border-yellow-600 dark:border-yellow-500 rounded-lg p-8 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/10 dark:to-gray-800">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
                      <Trophy className="text-yellow-600 dark:text-yellow-400" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Certificate of Completion
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Security Awareness Training</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <FileText size={16} />
                        Certificate Number
                      </div>
                      <p className="font-mono font-bold text-gray-900 dark:text-white">
                        {myCertificate.certificateNumber}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <Trophy size={16} />
                        Score
                      </div>
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {myCertificate.score}/{myCertificate.totalQuestions} ({Math.round((myCertificate.score / myCertificate.totalQuestions) * 100)}%)
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <Calendar size={16} />
                        Issue Date
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(myCertificate.issueDate)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <Calendar size={16} />
                        Valid Until
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(myCertificate.expiryDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleDownloadCertificate}
                      className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                      <Download size={20} />
                      Download Certificate
                    </button>
                    <button
                      onClick={handleStartQuiz}
                      className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <RotateCcw size={20} />
                      Retake Quiz
                    </button>
                  </div>
                </div>
              ) : (
                /* No Certificate Yet */
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                    <Award className="text-gray-400 dark:text-gray-600" size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No Certificate Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Complete the security awareness quiz with a passing score of 70% or higher to earn your certificate.
                  </p>
                  <button
                    onClick={handleStartQuiz}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    <Trophy size={20} />
                    Take Security Quiz
                  </button>
                </div>
              )}
            </div>

            {/* Quiz Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Shield className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">About the Quiz</h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>• 10 multiple-choice questions covering security best practices</li>
                    <li>• Passing score: 70% (7 out of 10 questions)</li>
                    <li>• Certificate valid for 1 year from issue date</li>
                    <li>• You can retake the quiz at any time to renew your certificate</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Quiz Interface */
          <div className="max-w-4xl mx-auto">
            {!showResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-8"
              >
                {/* Quiz Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <Shield className="text-yellow-600 dark:text-yellow-400" size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Awareness Quiz</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Score 70% or higher to earn your certificate
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <XCircle size={24} />
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Question {currentQuestion + 1} of {SECURITY_QUIZ.length}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedAnswers.filter(a => a !== undefined).length} answered
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-600 transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / SECURITY_QUIZ.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {SECURITY_QUIZ[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {SECURITY_QUIZ[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedAnswers[currentQuestion] === index
                            ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswers[currentQuestion] === index
                              ? 'border-yellow-600 bg-yellow-600'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedAnswers[currentQuestion] === index && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <span className="text-gray-900 dark:text-white">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQuestion] === undefined}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {currentQuestion === SECURITY_QUIZ.length - 1 ? 'Submit Quiz' : 'Next Question'}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Results */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center"
              >
                {selectedAnswers.reduce((total, answer, index) => total + (answer === SECURITY_QUIZ[index].correctAnswer ? 1 : 0), 0) >= 7 ? (
                  <>
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                        <Trophy className="text-green-600 dark:text-green-400" size={40} />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Congratulations!</h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        You passed the security awareness quiz
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {selectedAnswers.reduce((total, answer, index) => total + (answer === SECURITY_QUIZ[index].correctAnswer ? 1 : 0), 0)}/{SECURITY_QUIZ.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {Math.round((selectedAnswers.reduce((total, answer, index) => total + (answer === SECURITY_QUIZ[index].correctAnswer ? 1 : 0), 0) / SECURITY_QUIZ.length) * 100)}%
                          </p>
                        </div>
                      </div>
                      {myCertificate && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>Certificate Number: <span className="font-mono font-semibold text-gray-900 dark:text-white">{myCertificate.certificateNumber}</span></p>
                          <p>Valid Until: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(myCertificate.expiryDate)}</span></p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 justify-center">
                      {myCertificate && (
                        <button
                          onClick={handleDownloadCertificate}
                          className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                        >
                          <Download size={20} />
                          Download Certificate
                        </button>
                      )}
                      <button
                        onClick={() => setShowQuiz(false)}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        View Certificate
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                        <XCircle className="text-red-600 dark:text-red-400" size={40} />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Not Quite There</h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        You need at least 70% to pass (7 out of 10 questions)
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Your Score</p>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {selectedAnswers.reduce((total, answer, index) => total + (answer === SECURITY_QUIZ[index].correctAnswer ? 1 : 0), 0)}/{SECURITY_QUIZ.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Required</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            7/10
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleStartQuiz}
                        className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                      >
                        <RotateCcw size={20} />
                        Try Again
                      </button>
                      <button
                        onClick={() => setShowQuiz(false)}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatePage;
