// components/saml/LoginCard.tsx
'use client';
import React, { useState } from 'react';
import CustomButton from '@/components/ui/customButton';

export type LoginCardProps = {
    spName?: string | null;
    acsHint?: string | null;
    onSubmit: (creds: { username: string; password: string }) => Promise<void>;
    loading?: boolean;
    error?: string | null;
};

export default function LoginCard({ spName, acsHint, onSubmit, loading, error }: LoginCardProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-white text-gray-800">
            <header className="mb-3">
                <h2 className="m-0 text-lg font-semibold text-gray-900">
                    {spName ? `Sign in to ${spName}` : 'Sign in to Company IdP'}
                </h2>
                <p className="text-gray-600 mt-1 mb-0">Use your company credentials to continue</p>
            </header>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-md mb-3">{error}</div>}

            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    await onSubmit({ username, password });
                }}
            >
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username or email"
                    required
                    autoFocus
                    className="w-full px-4 py-3 mb-3 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-500"
                />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full px-4 py-3 mb-4 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-500"
                />

                {/* use customButton here */}

                <CustomButton
                    btnType="submit"
                    loading={loading}
                    style={`w-full h-12 mt-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold bg-black text-white hover:from-indigo-600 hover:to-purple-700`}
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </CustomButton>
            </form>

            <div className="mt-3 text-sm text-gray-500">
                {acsHint ? (
                    <div className="break-words">ACS: {acsHint}</div>
                ) : (
                    <div>Waiting for SAMLRequest...</div>
                )}
            </div>
            <div className="mt-2 text-xs text-gray-400">
                <a href="/support" className="text-indigo-600 hover:underline">
                    Need help?
                </a>
            </div>
        </div>
    );
}
