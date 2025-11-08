// components/saml/LoginCard.tsx
'use client';
import React, { useState } from 'react';

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
        <div
            style={{
                width: 420,
                padding: 28,
                borderRadius: 12,
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                background: '#fff',
            }}
        >
            <header style={{ marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>
                    {spName ? `Sign in to ${spName}` : 'Sign in to Company IdP'}
                </h2>
                <p style={{ color: '#666', marginTop: 6, marginBottom: 0 }}>
                    Use your company credentials to continue
                </p>
            </header>

            {error && (
                <div
                    style={{
                        background: '#fee',
                        color: '#c33',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 12,
                    }}
                >
                    {error}
                </div>
            )}

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
                    style={{
                        width: '100%',
                        padding: 12,
                        marginBottom: 10,
                        borderRadius: 8,
                        border: '1px solid #ddd',
                    }}
                />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Password"
                    required
                    style={{
                        width: '100%',
                        padding: 12,
                        marginBottom: 12,
                        borderRadius: 8,
                        border: '1px solid #ddd',
                    }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 8,
                        border: 'none',
                        background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                        color: '#fff',
                        fontWeight: 600,
                    }}
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
                {acsHint ? (
                    <div style={{ wordBreak: 'break-all' }}>ACS: {acsHint}</div>
                ) : (
                    <div>Waiting for SAMLRequest...</div>
                )}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                <a href="/support">Need help?</a>
            </div>
        </div>
    );
}
