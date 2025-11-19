import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { trainingAPI, employeeAPI, quizAPI } from '../services/api';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only load data when user is available
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) {
      console.log('User not available yet, skipping data load');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Loading training modules...');
      console.log('User:', user);
      
      // Get modules - backend returns { training_modules: [...] }
      const modulesRes = await trainingAPI.getModules();
      console.log('Modules response:', modulesRes);
      
      // Handle different response structures
      if (modulesRes && modulesRes.training_modules) {
        console.log('Found training_modules:', modulesRes.training_modules.length);
        setModules(modulesRes.training_modules);
      } else if (modulesRes && modulesRes.modules) {
        console.log('Found modules:', modulesRes.modules.length);
        setModules(modulesRes.modules);
      } else if (Array.isArray(modulesRes)) {
        console.log('Response is array:', modulesRes.length);
        setModules(modulesRes);
      } else {
        console.warn('Unexpected response structure:', modulesRes);
        setModules([]);
      }
      
      // Get progress (may fail if user doesn't have progress yet)
      try {
        const userId = user?.id || user?.employee_id;
        if (userId) {
          const progressRes = await employeeAPI.getProgress(userId);
          console.log('Progress response:', progressRes);
          if (progressRes && progressRes.progress) {
            setProgress(progressRes);
          }
        }
      } catch (progressErr) {
        // Progress is optional, don't show error
        console.warn('Could not load progress:', progressErr);
      }
    } catch (err) {
      console.error('Error loading training data:', err);
      console.error('Error details:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to load training data: ${errorMsg}`);
      // Set empty array so UI doesn't break
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (module) => {
    try {
      const response = await quizAPI.generate(module.id, module.module_name);
      // Backend returns: { message, quiz_session_id, total_questions }
      if (response && response.quiz_session_id) {
        navigate(`/quiz/${response.quiz_session_id}`);
      } else {
        setError('Failed to start quiz. Please try again.');
      }
    } catch (err) {
      setError('Failed to start quiz. Please try again.');
      console.error(err);
    }
  };

  const getModuleStatus = (moduleId) => {
    if (!progress?.completed_modules) return 'not_started';
    const completed = progress.completed_modules.find((m) => m.module_id === moduleId);
    if (completed?.is_completed) return 'completed';
    if (completed) return 'in_progress';
    return 'not_started';
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      not_started: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      completed: 'Completed',
      in_progress: 'In Progress',
      not_started: 'Not Started',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Security Training Portal</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {user?.first_name || user?.name || 'Employee'}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading training modules...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Training Modules</h2>
              <p className="text-gray-600">
                Complete the security training modules to earn your certificates.
              </p>
            </div>

            {modules.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No training modules available at this time.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {modules.map((module) => {
                  const status = getModuleStatus(module.id);
                  return (
                    <div
                      key={module.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {module.module_name}
                        </h3>
                        {getStatusBadge(status)}
                      </div>

                      {module.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {module.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Questions:</span>
                          <span>{module.question_count || 10}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Passing Score:</span>
                          <span>{module.passing_score_percentage || 70}%</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartQuiz(module)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                      >
                        {status === 'completed' ? 'Retake Quiz' : 'Start Quiz'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
