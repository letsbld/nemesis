'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiFetch';

export default function VerifyTotpPage() {
    const router = useRouter();
    const { login } = useAuth();

    // No need for a separate userId state, we can use a variable.
    const [totpToken, setTotpToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pendingUserId, setPendingUserId] = useState<string | null>(null);

    useEffect(() => {
        // Read the userId from sessionStorage on mount
        const storedUserId = sessionStorage.getItem('pendingUserId');
        setPendingUserId(storedUserId);

        // If someone navigates to this page directly without a pending user ID,
        // redirect them back to the login page immediately.
        if (!storedUserId) {
            // Redirect if no pending user ID (user tried to access page directly)
            router.replace('/auth/user/login');
        }
    }, [router]);


    const handleVerifySubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!pendingUserId) {
            setError("Session expired. Please log in again.");
            return;
        }

        if (totpToken.trim().length !== 6) {
            setError("Please enter a valid 6-digit verification code.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await apiFetch(`/auth/user/login/totp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: pendingUserId, // Use the ID read from session storage
                    totpToken: totpToken,
                }),
            });
            
            // ✅ On successful verification, log the user in
            login(result.token, result.user);

            // ✅ CRITICAL: Clean up the sessionStorage AFTER successful verification
            sessionStorage.removeItem('pendingUserId');
            
            router.replace('/user/applications'); // Redirect to the main user page after login

        } catch (err: any) {
            console.error('TOTP Verification failed:', err);
            setError(err.message || 'Invalid verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // If we haven't loaded the pendingUserId from sessionStorage yet or if it's not present
    if (!pendingUserId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <p className="text-center text-gray-600">Verifying session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Two-Factor Authentication</h2>
                <p className="text-center text-gray-600">
                    Enter the 6-digit code from your authenticator app.
                </p>
                <form onSubmit={handleVerifySubmit} className="space-y-6">
                    <div>
                        <label htmlFor="totpToken" className="block text-sm font-medium text-gray-700">
                            Verification Code
                        </label>
                        <input
                            id="totpToken"
                            name="totpToken"
                            type="text"
                            value={totpToken}
                            onChange={(e) => setTotpToken(e.target.value)}
                            required
                            maxLength={6}
                            pattern="\d{6}"
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            autoComplete="one-time-code"
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
