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
  User,
  Calendar,
  Hash,
  Search,
  Filter,
  ChevronRight,
  Trophy,
  AlertCircle,
  RotateCcw,
  FileText
} from 'lucide-react';

type CertificateStatus = 'completed' | 'in-progress' | 'expired' | 'failed';

interface Certificate {
  id: number;
  userName: string;
  userEmail: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  score: number;
  totalQuestions: number;
  status: CertificateStatus;
  completedAt: string | null;
  duration: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
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

const DUMMY_CERTIFICATES: Certificate[] = [
  {
    id: 1,
    userName: "John Mitchell",
    userEmail: "john.mitchell@company.com",
    certificateNumber: "CERT-2025-001234",
    issueDate: "2025-11-08T10:00:00Z",
    expiryDate: "2026-11-08T10:00:00Z",
    score: 10,
    totalQuestions: 10,
    status: "completed",
    completedAt: "2025-11-08T10:15:30Z",
    duration: "12m 30s"
  },
  {
    id: 2,
    userName: "Sarah Anderson",
    userEmail: "sarah.anderson@company.com",
    certificateNumber: "CERT-2025-001235",
    issueDate: "2025-11-07T14:30:00Z",
    expiryDate: "2026-11-07T14:30:00Z",
    score: 9,
    totalQuestions: 10,
    status: "completed",
    completedAt: "2025-11-07T14:42:15Z",
    duration: "11m 45s"
  },
  {
    id: 3,
    userName: "Michael Chen",
    userEmail: "michael.chen@company.com",
    certificateNumber: "CERT-2025-001236",
    issueDate: "2025-11-06T09:15:00Z",
    expiryDate: "2026-11-06T09:15:00Z",
    score: 10,
    totalQuestions: 10,
    status: "completed",
    completedAt: "2025-11-06T09:27:45Z",
    duration: "10m 20s"
  },
  {
    id: 4,
    userName: "Emily Rodriguez",
    userEmail: "emily.rodriguez@company.com",
    certificateNumber: "CERT-2025-001237",
    issueDate: "2025-11-05T16:00:00Z",
    expiryDate: "2026-11-05T16:00:00Z",
    score: 8,
    totalQuestions: 10,
    status: "completed",
    completedAt: "2025-11-05T16:18:20Z",
    duration: "15m 10s"
  },
  {
    id: 5,
    userName: "David Thompson",
    userEmail: "david.thompson@company.com",
    certificateNumber: "CERT-2025-001238",
    issueDate: "2025-11-04T11:30:00Z",
    expiryDate: "2026-11-04T11:30:00Z",
    score: 9,
    totalQuestions: 10,
    status: "completed",
    completedAt: "2025-11-04T11:45:50Z",
    duration: "13m 30s"
  },
  {
    id: 6,
    userName: "Lisa Martinez",
    userEmail: "lisa.martinez@company.com",
    certificateNumber: "CERT-2024-000987",
    issueDate: "2024-10-10T10:00:00Z",
    expiryDate: "2025-10-10T10:00:00Z",
    score: 10,
    totalQuestions: 10,
    status: "expired",
    completedAt: "2024-10-10T10:12:30Z",
    duration: "9m 45s"
  },
  {
    id: 7,
    userName: "Robert Johnson",
    userEmail: "robert.johnson@company.com",
    certificateNumber: "CERT-2025-001239",
    issueDate: "2025-11-03T13:00:00Z",
    expiryDate: "2026-11-03T13:00:00Z",
    score: 7,
    totalQuestions: 10,
    status: "completed",
    completedAt: "2025-11-03T13:16:40Z",
    duration: "14m 20s"
  },
  {
    id: 8,
    userName: "Jennifer Williams",
    userEmail: "jennifer.williams@company.com",
    certificateNumber: "IN-PROGRESS",
    issueDate: "",
    expiryDate: "",
    score: 5,
    totalQuestions: 10,
    status: "in-progress",
    completedAt: null,
    duration: "8m 15s"
  },
  {
    id: 9,
    userName: "James Davis",
    userEmail: "james.davis@company.com",
    certificateNumber: "FAILED-001",
    issueDate: "",
    expiryDate: "",
    score: 5,
    totalQuestions: 10,
    status: "failed",
    completedAt: "2025-11-02T15:30:00Z",
    duration: "10m 00s"
  },
  {
    id: 10,
    userName: "Patricia Brown",
    userEmail: "patricia.brown@company.com",
    certificateNumber: "CERT-2025-001240",
    issueDate: "2025-11-01T10:00:00Z",
    expiryDate: "2026-11-01T10:00:00Z",
    score: 10,
    totalQuestions: 10,
    status: "completed",
    completedAt: "2025-11-01T10:11:25Z",
    duration: "11m 00s"
  }
];

const CertificatePage = () => {
  const [certificates, setCertificates] = useState<Certificate[]>(DUMMY_CERTIFICATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: CertificateStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            <Clock size={12} />
            In Progress
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
            <AlertCircle size={12} />
            Expired
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            <XCircle size={12} />
            Failed
          </span>
        );
    }
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
      const newCertificate: Certificate = {
        id: certificates.length + 1,
        userName: "Current User",
        userEmail: "user@company.com",
        certificateNumber: `CERT-2025-${String(certificates.length + 1).padStart(6, '0')}`,
        issueDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        score: score,
        totalQuestions: SECURITY_QUIZ.length,
        status: "completed",
        completedAt: new Date().toISOString(),
        duration: `${minutes}m ${seconds}s`
      };
      setCertificates([newCertificate, ...certificates]);
      setSelectedCertificate(newCertificate);
    }

    setShowResults(true);
  };

  const handleDownloadCertificate = (cert: Certificate) => {
    // In a real app, this would generate a PDF certificate
    const certificateText = `
SECURITY AWARENESS CERTIFICATE

This is to certify that
${cert.userName}
${cert.userEmail}

Has successfully completed the Security Awareness Training
Score: ${cert.score}/${cert.totalQuestions}
Certificate Number: ${cert.certificateNumber}
Issue Date: ${formatDate(cert.issueDate)}
Valid Until: ${formatDate(cert.expiryDate)}
    `.trim();

    const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.certificateNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch =
      cert.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || cert.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: certificates.length,
    completed: certificates.filter(c => c.status === 'completed').length,
    inProgress: certificates.filter(c => c.status === 'in-progress').length,
    expired: certificates.filter(c => c.status === 'expired').length,
    passRate: Math.round((certificates.filter(c => c.status === 'completed').length / certificates.length) * 100)
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101828] p-6">
      <div className="max-w-7xl mx-auto">
        {!showQuiz ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Award className="text-yellow-600 dark:text-yellow-400" size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Certificates</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Complete the security awareness quiz to earn your certificate
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStartQuiz}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  <Trophy size={16} />
                  Take Security Quiz
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Certificates</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completed}</p>
                </div>
                <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.inProgress}</p>
                </div>
                <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.expired}</p>
                </div>
                <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pass Rate</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.passRate}%</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or certificate number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400" size={20} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="expired">Expired</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Certificates List */}
            <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Certificate #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCertificates.map((cert) => (
                      <motion.tr
                        key={cert.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                              <User size={16} className="text-gray-400" />
                              {cert.userName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{cert.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm font-mono text-gray-900 dark:text-white">
                            <Hash size={14} className="text-gray-400" />
                            {cert.certificateNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`text-sm font-bold ${
                              cert.score >= 9 ? 'text-green-600 dark:text-green-400' :
                              cert.score >= 7 ? 'text-blue-600 dark:text-blue-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {cert.score}/{cert.totalQuestions}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ({Math.round((cert.score / cert.totalQuestions) * 100)}%)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock size={14} />
                            {cert.duration}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar size={14} />
                            {formatDate(cert.issueDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(cert.status)}</td>
                        <td className="px-6 py-4">
                          {cert.status === 'completed' && (
                            <button
                              onClick={() => handleDownloadCertificate(cert)}
                              className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                            >
                              <Download size={14} />
                              Download
                            </button>
                          )}
                          {cert.status === 'failed' && (
                            <button
                              onClick={handleStartQuiz}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              <RotateCcw size={14} />
                              Retake
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
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
                          Answer all questions correctly to earn your certificate
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
                      {selectedCertificate && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>Certificate Number: <span className="font-mono font-semibold text-gray-900 dark:text-white">{selectedCertificate.certificateNumber}</span></p>
                          <p>Valid Until: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedCertificate.expiryDate)}</span></p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 justify-center">
                      {selectedCertificate && (
                        <button
                          onClick={() => handleDownloadCertificate(selectedCertificate)}
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
                        View All Certificates
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
                        Back to Certificates
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
