import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { quizAPI } from '../services/api';

const QuizReview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReview();
  }, [sessionId]);

  const loadReview = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getReview(sessionId);
      // Backend now returns: { quiz_session_id, topic, date_generated, questions: [...], score, total_questions, percentage, passed, result_id }
      // Questions include: id, question, options, correct_answer, correct_answer_text, user_answer, user_answer_text, is_correct, explanation
      if (response && response.questions) {
        const reviewData = {
          quiz_session_id: response.quiz_session_id,
          topic: response.topic,
          date_generated: response.date_generated,
          score: response.score || 0,
          total_questions: response.total_questions || response.questions.length,
          percentage: response.percentage || 0,
          passed: response.passed || false,
          result_id: response.result_id,
          questions: response.questions.map((q) => ({
            id: q.id,
            question_text: q.question,
            correct_answer: q.correct_answer,
            correct_answer_text: q.correct_answer_text || (q.options && q.options[q.correct_answer] ? q.options[q.correct_answer] : `Option ${q.correct_answer + 1}`),
            options: q.options,
            explanation: q.explanation,
            user_answer: q.user_answer,
            user_answer_text: q.user_answer_text || (q.user_answer !== null && q.user_answer !== undefined && q.options && q.options[q.user_answer] ? q.options[q.user_answer] : (q.user_answer !== null && q.user_answer !== undefined ? `Option ${q.user_answer + 1}` : null)),
            is_correct: q.is_correct,
          })),
        };
        setReview(reviewData);
      } else {
        setError(response?.error || 'Failed to load quiz review. Please try again.');
      }
    } catch (err) {
      setError('Failed to load quiz review. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = () => {
    if (review?.result_id) {
      navigate(`/certificate/${review.result_id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  if (error && !review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!review) {
    return null;
  }

  const passed = review.passed || false;
  const score = review.score || 0;
  const totalQuestions = review.total_questions || 0;
  const percentage = review.percentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
            <button
              onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                passed ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {passed ? (
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {passed ? 'Congratulations!' : 'Keep Learning'}
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              You scored {score} out of {totalQuestions} ({percentage}%)
            </p>
            {review.passing_score_percentage && (
              <p className="text-sm text-gray-500">
                Passing score: {review.passing_score_percentage}%
              </p>
            )}
          </div>
        </div>

        {/* Questions Review */}
        {review.questions && review.questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Question Review</h3>
            <div className="space-y-6">
              {review.questions.map((question, index) => {
                const isCorrect = question.is_correct;
                const userAnswer = question.user_answer;
                const correctAnswer = question.correct_answer;

                return (
                  <div
                    key={question.id || index}
                    className={`p-6 rounded-lg border-2 ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        Question {index + 1}: {question.question_text}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                        <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {userAnswer || 'No answer provided'}
                        </p>
                      </div>

                      {!isCorrect && correctAnswer && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
                          <p className="text-sm text-green-700">{correctAnswer}</p>
                        </div>
                      )}

                      {question.explanation && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-1">Explanation:</p>
                          <p className="text-sm text-gray-600">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          {passed && review.result_id && (
            <button
              onClick={handleViewCertificate}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              View Certificate
            </button>
          )}
          <button
            onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuizReview;

