'use client';

import React, { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import CustomButton from '@/components/ui/customButton';

interface PasskeyAuthProps {
    onSuccess: (user: any) => void;
    onError: (error: string) => void;
}

export default function PasskeyAuth({ onSuccess, onError }: PasskeyAuthProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [showUsernameInput, setShowUsernameInput] = useState(false);

    const handlePasskeyLogin = async () => {
        setIsLoading(true);
        try {
            // Start authentication
            const beginResponse = await fetch('/api/auth/passkey/authenticate/begin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username || undefined }),
            });

            if (!beginResponse.ok) {
                throw new Error('Failed to start authentication');
            }

            const { options, challenge } = await beginResponse.json();

            // Get authentication response from browser
            const authenticationResponse = await startAuthentication({ optionsJSON: options });

            // Complete authentication
            const completeResponse = await fetch('/api/auth/passkey/authenticate/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authenticationResponse,
                    challenge,
                }),
            });

            if (!completeResponse.ok) {
                throw new Error('Authentication failed');
            }

            const result = await completeResponse.json();

            if (result.success) {
                onSuccess(result.user);
            } else {
                onError('Authentication failed');
            }
        } catch (error: any) {
            console.error('Passkey authentication error:', error);
            onError(error.message || 'Passkey authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterPasskey = async () => {
        if (!username.trim()) {
            onError('Please enter a username');
            return;
        }

        setIsLoading(true);
        try {
            // Start registration
            const beginResponse = await fetch('/api/auth/passkey/register/begin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            if (!beginResponse.ok) {
                const errorData = await beginResponse.json();
                throw new Error(errorData.error || 'Failed to start registration');
            }

            const { options, userId } = await beginResponse.json();

            // Get registration response from browser
            const registrationResponse = await startRegistration({ optionsJSON: options });

            // Complete registration
            const completeResponse = await fetch('/api/auth/passkey/register/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    registrationResponse,
                }),
            });

            if (!completeResponse.ok) {
                throw new Error('Registration failed');
            }

            const result = await completeResponse.json();

            if (result.success) {
                onSuccess({
                    message: 'Passkey registered successfully! You can now use it to sign in.',
                });
                setShowUsernameInput(false);
                setUsername('');
            } else {
                onError('Registration failed');
            }
        } catch (error: any) {
            console.error('Passkey registration error:', error);
            onError(error.message || 'Passkey registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {!showUsernameInput ? (
                <>
                    <CustomButton
                        name={isLoading ? 'Authenticating...' : '🔐 Sign in with Passkey'}
                        onClick={handlePasskeyLogin}
                        btnType="button"
                        style="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        loading={isLoading}
                    />

                    <div className="text-center">
                        <button
                            onClick={() => setShowUsernameInput(true)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            disabled={isLoading}
                        >
                            Register a new passkey
                        </button>
                    </div>
                </>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex gap-3">
                        <CustomButton
                            name={isLoading ? 'Registering...' : 'Register Passkey'}
                            onClick={handleRegisterPasskey}
                            btnType="button"
                            style="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
                            loading={isLoading}
                        />

                        <CustomButton
                            name="Cancel"
                            onClick={() => {
                                setShowUsernameInput(false);
                                setUsername('');
                            }}
                            btnType="button"
                            style="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium"
                        />
                    </div>
                </div>
            )}

            <div className="text-center text-sm text-gray-500">
                <p>
                    Passkeys use your device&apos;s built-in security features like fingerprint,
                    face recognition, or PIN for secure, password-free authentication.
                </p>
            </div>
        </div>
    );
}
