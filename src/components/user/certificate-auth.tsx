'use client';

import { useState } from 'react';
import type { AuthMode } from '@/types/user.types';

interface AuthFormsProps {
  authMode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onLogin: (employeeId: string) => Promise<void>;
  onRegister: (formData: {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
    position: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export function CertificateAuthForms({ authMode, onModeChange, onLogin, onRegister, isLoading }: AuthFormsProps) {
  const [loginEmployeeId, setLoginEmployeeId] = useState('');
  const [registerData, setRegisterData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    position: '',
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(loginEmployeeId.trim());
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRegister(registerData);
  };

  const updateRegisterField = (field: string, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h2 className="text-center mb-8 text-2xl font-bold text-gray-800">Employee Access</h2>

      <div className="flex mb-8 rounded-xl overflow-hidden border-2 border-gray-200">
        <button
          onClick={() => onModeChange('login')}
          className={`flex-1 py-4 px-6 font-semibold transition-all ${
            authMode === 'login'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          🔑 Login
        </button>
        <button
          onClick={() => onModeChange('register')}
          className={`flex-1 py-4 px-6 font-semibold transition-all ${
            authMode === 'register'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          📝 Register
        </button>
      </div>

      {authMode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div>
            <label htmlFor="login-employee-id" className="block text-sm font-semibold text-gray-700 mb-2">
              Employee ID
            </label>
            <input
              type="text"
              id="login-employee-id"
              value={loginEmployeeId}
              onChange={(e) => setLoginEmployeeId(e.target.value)}
              placeholder="Enter your Employee ID (e.g., EMP001)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : '🔑 Login & Start Quiz'}
          </button>
          <p className="text-center text-gray-500 italic text-sm">
            Already registered? Just enter your Employee ID to continue.
          </p>
        </form>
      )}

      {authMode === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employee-id" className="block text-sm font-semibold text-gray-700 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                id="employee-id"
                value={registerData.employee_id}
                onChange={(e) => updateRegisterField('employee_id', e.target.value)}
                placeholder="e.g., EMP001"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="first-name" className="block text-sm font-semibold text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="first-name"
                value={registerData.first_name}
                onChange={(e) => updateRegisterField('first_name', e.target.value)}
                placeholder="First Name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="last-name" className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="last-name"
                value={registerData.last_name}
                onChange={(e) => updateRegisterField('last_name', e.target.value)}
                placeholder="Last Name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={registerData.email}
                onChange={(e) => updateRegisterField('email', e.target.value)}
                placeholder="Email Address"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                Department *
              </label>
              <input
                type="text"
                id="department"
                value={registerData.department}
                onChange={(e) => updateRegisterField('department', e.target.value)}
                placeholder="Department"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-semibold text-gray-700 mb-2">
                Position/Title
              </label>
              <input
                type="text"
                id="position"
                value={registerData.position}
                onChange={(e) => updateRegisterField('position', e.target.value)}
                placeholder="Position/Title"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Registering...' : '🚀 Register & Start Quiz'}
          </button>
          <p className="text-center text-gray-500 italic text-sm">
            New employee? Fill in all details to register and start training.
          </p>
        </form>
      )}
    </div>
  );
}
