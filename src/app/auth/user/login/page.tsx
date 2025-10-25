'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { apiFetch } from '@/lib/apiFetch';
import { useAuth } from '@/context/AuthContext';
import { loginWithPasskey } from '@/components/user/passkey';

interface DecodedToken {
  id: string;
  username: string;
  role?: string;
  exp?: number;
  requiresTotpSetup?: boolean;
}

export default function UserLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPasskeyPopup, setShowPasskeyPopup] = useState(false);
  const passkeyTriggered = useRef(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    totpToken: '',
  });
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // 🔐 Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('authUser');
    if (token && userStr) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            router.replace('/admin/dashboard');
          } else if (user.role === 'user') {
            if (user.requiresTotpSetup) {
              router.replace('/user/totp?required=true');
            } else {
              router.replace('/user/applications');
            }
          }
        }
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleNext = async () => {
    if (!formData.username.trim()) {
      setErrors({ username: 'Email is required' });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // ✅ Check if this user has passkey registered
      const response = await apiFetch(`/passkey/authenticate/options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: formData.username}), // include identifier if required
      });

      // ✅ Check response and handle accordingly
      if (response) {
        setShowPasskeyPopup(true);
      } else {
        setStep(2);
      }
    } catch (err) {
      console.error('Passkey check failed:', err);
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setErrors({});
    setIsLoading(true);
    try {
      const result = await loginWithPasskey(formData.username);
      if (result && result.token && result.user) {
        login(result.token, result.user);
        if (result.user.role === 'admin') router.replace('/admin/dashboard');
        else router.replace('/user/applications');
      } else {
        setErrors({ general: 'Authenticated, but no session info returned.' });
      }
    } catch (err: any) {
      setErrors({ general: err?.message || 'Passkey login failed' });
    } finally {
      setIsLoading(false);
      setShowPasskeyPopup(false);
    }
  };

  // Auto-trigger passkey login when showPasskeyPopup is true, only once per trigger
  useEffect(() => {
    if (showPasskeyPopup && !passkeyTriggered.current) {
      passkeyTriggered.current = true;
      handlePasskeyLogin();
    }
    if (!showPasskeyPopup) {
      passkeyTriggered.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPasskeyPopup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await apiFetch(`/auth/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (result.token && result.user && !result.requireTotpSetup) {
        login(result.token, result.user);
        router.replace('/user/applications');
      } else if (result.requireTotp && result.userId) {
        sessionStorage.setItem('pendingUserId', result.userId);
        router.replace(`/auth/user/verify-totp`);
      } else if (result.requireTotpSetup && result.token && result.userId) {
        sessionStorage.setItem('tempTotpToken', result.token);
        sessionStorage.setItem('pendingUserId', result.userId);
        router.replace(`/auth/user/totp-setup`);
      } else {
        throw new Error('Invalid or unexpected response from server.');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setErrors({ general: err.message || 'Invalid username or password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex pt-3 pb-10 justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl flex flex-col md:flex-row max-w-4xl w-full overflow-hidden m-4 sm:m-6 lg:m-10">
        {/* Left Side */}
        <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-between p-6 order-2 md:order-1">
          <div className="flex-grow flex mt-5 justify-center">
            <img
              src="/lap-img.png"
              alt="Security Illustration"
              className="max-w-[200px] sm:max-w-xs md:max-w-sm object-contain"
            />
          </div>
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-sm sm:text-md text-gray-500 mb-1">Are you an administrator?</p>
            <Link
              href="/auth/admin/login"
              className="text-blue-600 hover:text-blue-500 text-sm sm:text-base font-medium"
            >
              Admin Login →
            </Link>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center order-1 md:order-2">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">User Login</h1>
          </div>

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
              </div>

              <button
                onClick={handleNext}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium"
              >
                {isLoading ? 'Checking...' : 'Next'}
              </button>
            </div>
          )}

          {/* Step 2: Password + TOTP */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 py-3 text-white rounded-md"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 text-white rounded-md"
                >
                  {isLoading ? 'Signing in...' : 'Login'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
