import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, trainingAPI } from '../services/api';

const AdminDashboard = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [modalType, setModalType] = useState(null); // 'employees', 'completed_modules', 'active_sessions', 'certificates'
  const [modalData, setModalData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [modules, setModules] = useState([]);
  const [resetQuizModal, setResetQuizModal] = useState(null); // { employeeId, employeeName }
  const [selectedModuleId, setSelectedModuleId] = useState('');

  useEffect(() => {
    loadData();
    loadModules();
  }, [activeTab, filters]);

  const loadModules = async () => {
    try {
      const response = await trainingAPI.getModules();
      if (response.training_modules) {
        setModules(response.training_modules);
      } else if (Array.isArray(response)) {
        setModules(response);
      }
    } catch (err) {
      console.error('Failed to load modules:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'overview') {
        const response = await adminAPI.getDashboardOverview();
        // Backend returns { message, overview } not { success, overview }
        if (response.overview) {
          setOverview(response.overview);
        } else if (response.error) {
          setError(response.error || 'Failed to load dashboard overview');
        } else {
          setError('Failed to load dashboard overview');
        }
      } else if (activeTab === 'employees') {
        const response = await adminAPI.getEmployees(filters);
        // Backend returns { message, employees } not { success, employees }
        if (response.employees) {
          setEmployees(response.employees || []);
        } else if (response.error) {
          setError(response.error || 'Failed to load employees');
        } else {
          setError('Failed to load employees');
        }
      }
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetQuizClick = (employee) => {
    setResetQuizModal({
      employeeId: employee.employee_id,
      employeeName: `${employee.first_name} ${employee.last_name}`
    });
    setSelectedModuleId('');
  };

  const handleResetQuizConfirm = async () => {
    if (!selectedModuleId) {
      alert('Please select a module to reset.');
      return;
    }

    if (!window.confirm(`Are you sure you want to reset ${resetQuizModal.employeeName}'s quiz for the selected module?`)) {
      return;
    }

    try {
      const response = await adminAPI.resetEmployeeQuiz(resetQuizModal.employeeId, selectedModuleId);
      // Backend returns { message, result: { success, message } }
      if (response.result?.success || response.success || response.message) {
        alert(response.message || response.result?.message || 'Quiz status reset successfully');
        setResetQuizModal(null);
        setSelectedModuleId('');
        loadData();
        // Reload employee details if modal is open
        if (selectedEmployee) {
          handleViewEmployee(selectedEmployee);
        }
      } else {
        alert(response.error || response.result?.error || 'Failed to reset quiz status');
      }
    } catch (err) {
      alert('Failed to reset quiz status. Please try again.');
      console.error(err);
    }
  };

  const handleViewEmployee = async (employee) => {
    setSelectedEmployee(employee);
    setLoadingDetails(true);
    setEmployeeDetails(null);

    try {
      const response = await adminAPI.getEmployeeTrainingStatus(employee.employee_id);
      if (response.training_records) {
        setEmployeeDetails(response.training_records);
      } else if (response.error) {
        setError(response.error || 'Failed to load employee details');
      }
    } catch (err) {
      setError('Failed to load employee details. Please try again.');
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeEmployeeModal = () => {
    setSelectedEmployee(null);
    setEmployeeDetails(null);
  };

  const handleStatCardClick = async (type) => {
    setModalType(type);
    setLoadingModal(true);
    setModalData(null);

    try {
      if (type === 'employees') {
        // Switch to employees tab
        setActiveTab('employees');
        setModalType(null);
        return;
      } else if (type === 'completed_modules') {
        const response = await adminAPI.getModuleStatusSummary();
        // Backend returns { message, modules }
        if (response.modules) {
          setModalData(response.modules.filter(m => m.completed_by > 0));
        } else {
          setModalData([]);
        }
      } else if (type === 'active_sessions') {
        // Fetch active quiz sessions
        const response = await adminAPI.getActiveSessions();
        // Backend returns { message, sessions }
        if (response.sessions) {
          setModalData(response.sessions);
        } else {
          setModalData([]);
        }
      } else if (type === 'certificates') {
        // Fetch certificates
        const response = await adminAPI.getCertificates();
        // Backend returns { message, certificates }
        if (response.certificates) {
          setModalData(response.certificates);
        } else {
          setModalData([]);
        }
      }
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoadingModal(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'blue', onClick }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
    };

    return (
      <div 
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>{icon}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {admin?.username || 'Admin'}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'employees'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Employees
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && overview && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Employees"
                    value={overview.total_employees || 0}
                    color="blue"
                    onClick={() => handleStatCardClick('employees')}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Completed Modules"
                    value={overview.completed_modules || 0}
                    subtitle={`of ${overview.total_modules || 0} total`}
                    color="green"
                    onClick={() => handleStatCardClick('completed_modules')}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Active Sessions"
                    value={overview.active_sessions || 0}
                    color="yellow"
                    onClick={() => handleStatCardClick('active_sessions')}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Certificates Issued"
                    value={overview.certificates_issued || 0}
                    color="purple"
                    onClick={() => handleStatCardClick('certificates')}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    }
                  />
                </div>

                {overview.recent_activity && overview.recent_activity.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {overview.recent_activity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'employees' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Employee Management</h2>
                  <div className="flex gap-3">
                    <select
                      value={filters.department || ''}
                      onChange={(e) => setFilters({ ...filters, department: e.target.value || undefined })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Departments</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                    <select
                      value={filters.training_status || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          training_status: e.target.value || undefined,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Training Status</option>
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="not_started">Not Started</option>
                    </select>
                  </div>
                </div>

                {employees.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <p className="text-gray-600">No employees found.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((employee) => (
                          <tr 
                            key={employee.employee_id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewEmployee(employee)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {employee.first_name} {employee.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{employee.department || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {employee.completed_modules || 0} / {employee.total_modules || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  employee.training_status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : employee.training_status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {employee.training_status === 'completed'
                                  ? 'Completed'
                                  : employee.training_status === 'in_progress'
                                  ? 'In Progress'
                                  : 'Not Started'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  handleResetQuizClick(employee);
                                }}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Reset Quiz
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedEmployee.first_name} {selectedEmployee.last_name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{selectedEmployee.email}</p>
                <p className="text-sm text-gray-500">{selectedEmployee.department || 'N/A'}</p>
              </div>
              <button
                onClick={closeEmployeeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-600">Loading employee details...</p>
                </div>
              ) : employeeDetails && employeeDetails.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Modules</h3>
                  <div className="space-y-4">
                    {employeeDetails.map((record, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-md font-semibold text-gray-900">
                              {record.module_name || `Module ${record.module_id}`}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Status: 
                              <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  record.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : record.status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {record.status || 'Not Started'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Attempts</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {record.attempts || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Score</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {record.score !== null && record.score !== undefined
                                ? `${record.score}`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Percentage</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {record.percentage !== null && record.percentage !== undefined
                                ? `${record.percentage}%`
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {record.completion_date && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Completed: {new Date(record.completion_date).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {record.last_attempt_date && !record.completion_date && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Last Attempt: {new Date(record.last_attempt_date).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {record.certificate_generated && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Certificate Generated
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No training records found for this employee.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stat Card Details Modal */}
      {modalType && modalType !== 'employees' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalType === 'completed_modules' && 'Completed Modules'}
                {modalType === 'active_sessions' && 'Active Quiz Sessions'}
                {modalType === 'certificates' && 'Certificates Issued'}
              </h2>
              <button
                onClick={() => {
                  setModalType(null);
                  setModalData(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {loadingModal ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              ) : modalData && modalData.length > 0 ? (
                <div>
                  {modalType === 'completed_modules' && (
                    <div className="space-y-4">
                      {modalData.map((module, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-md font-semibold text-gray-900">
                                {module.module_name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Completed by {module.completed_by} employee(s)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Completion Rate</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {module.completion_percentage || 0}%
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500">Total Employees</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {module.total_employees || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">In Progress</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {module.in_progress || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Average Score</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {module.average_percentage ? `${Math.round(module.average_percentage)}%` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {modalType === 'active_sessions' && (
                    <div className="space-y-4">
                      {modalData.map((session, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-md font-semibold text-gray-900">
                                {session.first_name} {session.last_name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{session.email}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Module: {session.module_name || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Topic: {session.topic || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Started</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {session.date_generated ? new Date(session.date_generated).toLocaleString() : 'N/A'}
                              </p>
                              {session.hours_old && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {Math.round(session.hours_old * 10) / 10} hours ago
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Session ID: {session.session_id} | Questions: {session.total_questions || 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {modalType === 'certificates' && (
                    <div className="space-y-4">
                      {modalData.map((cert, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-md font-semibold text-gray-900">
                                {cert.first_name} {cert.last_name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{cert.email}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Module: {cert.module_name}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Certificate Issued
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500">Score</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {cert.score !== null && cert.score !== undefined ? cert.score : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Percentage</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {cert.percentage !== null && cert.percentage !== undefined ? `${cert.percentage}%` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Completed</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {cert.completion_date ? new Date(cert.completion_date).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No data available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Quiz Modal */}
      {resetQuizModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Reset Quiz</h3>
              <p className="text-sm text-gray-600 mt-1">
                Select a module to reset for {resetQuizModal.employeeName}
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Module
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">-- Select a module --</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.module_name}
                    </option>
                  ))}
                </select>
              </div>
              {modules.length === 0 && (
                <p className="text-sm text-gray-500 mb-4">Loading modules...</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setResetQuizModal(null);
                  setSelectedModuleId('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                onClick={handleResetQuizConfirm}
                disabled={!selectedModuleId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Reset Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

