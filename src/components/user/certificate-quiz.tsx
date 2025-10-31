'use client';

import { QuizQuestion } from '@/types/user.types';

interface CertificateQuizProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: number | undefined;
  onAnswerSelect: (answerIndex: number) => void;
  onNext: () => void;
  isLoading: boolean;
}

export function CertificateQuiz({
  questions,
  currentQuestionIndex,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  isLoading,
}: CertificateQuizProps) {
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      <div className="text-center font-semibold text-gray-700">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(index)}
              disabled={isLoading}
              className={`w-full p-4 text-left border-2 rounded-xl font-medium transition-all ${
                selectedAnswer === index
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-500 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="font-bold">{String.fromCharCode(65 + index)}.</span> {option}
            </button>
          ))}
        </div>
      </div>

      {selectedAnswer !== undefined && (
        <button
          onClick={onNext}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : isLastQuestion ? '🏁 Finish Quiz' : 'Next Question'}
        </button>
      )}
    </div>
  );
}
