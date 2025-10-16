'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        totpToken: '',
    });
    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
        general?: string;
    }>({});
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
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // ✅ Clear error for the field being edited
        setErrors((prev) => ({
            ...prev,
            [name]: undefined,
            general: undefined,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      // --- Form validation remains the same ---
      const newErrors: typeof errors = {};
      if (!formData.username.trim()) {
          newErrors.username = 'Username is required';
      }
      if (!formData.password) {
          newErrors.password = 'Password is required';
      }
      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
      }
      // --- End of validation ---

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

        // Case 1: Successful login with final token (user already has 2FA)
        if (result.token && result.user && !result.requireTotpSetup) {
            login(result.token, result.user);
            router.replace('/user/applications');
        
        // Case 2: Existing user needs to verify with their TOTP code
        } else if (result.requireTotp && result.userId) {
            sessionStorage.setItem('pendingUserId', result.userId);
            router.replace(`/auth/user/verify-totp`);

        // ✅ NEW Case 3: User must set up TOTP for the first time
        } else if (result.requireTotpSetup && result.token && result.userId) {
            // Store the temporary token and userId for the setup process
            sessionStorage.setItem('tempTotpToken', result.token);
            sessionStorage.setItem('pendingUserId', result.userId);
            router.replace(`/auth/user/totp-setup`);
        
        // Case 4: Unexpected response
        } else {
            throw new Error("Invalid or unexpected response from server.");
        }

      } catch (err: any) {
          console.error('Login failed:', err);
          setErrors({
              general: err.message || 'Invalid username or password.',
          });
      } finally {
          setIsLoading(false);
      }
    };

    const handlePasskeyLogin = async () => {
        setErrors({});
        setIsLoading(true);
        try {
            const result = await loginWithPasskey(formData.username);
            // result should contain user/token if backend returns them after passkey login
            if (result && result.token && result.user) {
                // Use auth context instead of direct localStorage manipulation
                login(result.token, result.user);
                
                // Redirect based on role
                if (result.user.role === 'admin') {
                    router.replace('/admin/dashboard');
                } else {
                    router.replace('/user/applications');
                }
            } else {
                setErrors({
                    general: 'Authenticated, but no session info returned.'
                });
            }
        } catch (err: any) {
            console.error('Passkey login failed:', err);
            setErrors({
                general: err?.error || err?.message || 'Passkey login failed'
            });
        } finally {
            setIsLoading(false);
        }
    };

   return (
  <div className="flex pt-3 pb-10 justify-center min-h-screen bg-gray-100">
    {/* Card with Image + Login */}
    <div className="bg-white shadow-xl rounded-2xl flex max-w-4xl w-full overflow-hidden m-10">
      
      {/* Left Side - Image */}
      <div className="w-1/2 bg-white flex flex-col items-center justify-between p-6">
        {/* Centered Image */}
        <div className="flex-grow flex mt-5 justify-center">
            <img
            src="/lap-img.png"
            alt="Security Illustration"
            className="max-w-xs"
            />
        </div>

        {/* Admin Login at Bottom */}
        <div className="text-center mb-10">
            <p className="text-md text-gray-500 mb-1">Are you an administrator?</p>
            <Link
            href="/auth/admin/login"
            className="text-blue-600 hover:text-blue-500 text-sm font-large"
            >
            Admin Login →
            </Link>
        </div>
        </div>


      {/* Right Side - Login Form */}
      <div className="w-1/2 p-8 flex flex-col justify-center">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-black">User Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none hover:border-blue-500 focus:ring-blue-500 focus:border-blue-500 ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none hover:border-blue-500 focus:ring-blue-500 focus:border-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* General Errors */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {errors.general}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.username || !formData.password}
            className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Passkey Button */}
        <button
          type="button"
          onClick={handlePasskeyLogin}
          disabled={isLoading || !formData.username}
          className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
        >
          {isLoading ? "Authenticating..." : "Sign in with Passkey"}
        </button>
      </div>
    </div>

    {/* Admin Login (Below the Card) */}
    
  </div>
);

}
