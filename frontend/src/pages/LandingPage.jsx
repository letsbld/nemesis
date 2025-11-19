import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { userRole, user, admin } = useAuth();

  const isAdmin = userRole === 'admin' || !!admin;
  const isUser = userRole === 'user' || !!user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Security Training Portal</h1>
          <p className="text-lg text-gray-600">Welcome to the training system</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quiz Access Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Take Quiz</h2>
              <p className="text-gray-600 mb-6">
                Access training modules and complete security awareness quizzes
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Go to Quiz Dashboard
              </button>
            </div>
          </div>

        </div>

        {/* Info message for users */}
        {isUser && !isAdmin && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700">
              You have access to quiz functionality. Complete training modules to earn certificates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;

