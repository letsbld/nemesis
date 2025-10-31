'use client';

import { EmployeeInfo, SubmitAnswersResponse, ProgressItem } from '@/types/user.types';

interface CertificateResultsProps {
  results: SubmitAnswersResponse;
  employeeInfo: EmployeeInfo;
  progressData?: ProgressItem[];
  onGenerateCertificate: () => void;
  onRetakeQuiz: () => void;
  isLoading: boolean;
}

export function CertificateResults({
  results,
  employeeInfo,
  progressData,
  onGenerateCertificate,
  onRetakeQuiz,
  isLoading,
}: CertificateResultsProps) {
  const { score, total_questions, percentage, is_passed } = results;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🎯 Quiz Results</h2>

      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-gray-800 mb-4">
          {score}/{total_questions}
        </div>
        <div className="text-2xl text-gray-600 mb-2">({percentage}%)</div>
        <div
          className={`text-3xl font-bold ${
            is_passed ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {is_passed ? '✅ PASSED' : '❌ FAILED'}
        </div>
      </div>

      {progressData && progressData.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Your Training Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-600">Employee:</span>
              <span className="font-semibold text-gray-800">
                {employeeInfo.first_name} {employeeInfo.last_name}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-600">Department:</span>
              <span className="font-semibold text-gray-800">{employeeInfo.department || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-600">Email:</span>
              <span className="font-semibold text-gray-800">{employeeInfo.email}</span>
            </div>

            {progressData.length > 0 && (
              <div className="mt-4">
                <strong className="text-gray-700 block mb-2">Recent Training History:</strong>
                <div className="space-y-2">
                  {progressData.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <span className="text-gray-600">{item.module_name || 'Security Training'}</span>
                      <span className={`font-semibold ${item.is_completed ? 'text-green-600' : 'text-yellow-600'}`}>
                        {item.is_completed ? '✅ Completed' : '⏳ In Progress'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {is_passed && (
          <button
            onClick={onGenerateCertificate}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : '🏆 Generate Certificate'}
          </button>
        )}
        <button
          onClick={onRetakeQuiz}
          disabled={isLoading}
          className="w-full py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔄 Take Another Quiz
        </button>
      </div>
    </div>
  );
}
