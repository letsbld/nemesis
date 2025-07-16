'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface TOTPStatus {
    enabled: boolean;
    hasSecret: boolean;
}

export default function TOTPSetupPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRequired = searchParams.get('required') === 'true';
    const [totpStatus, setTotpStatus] = useState<TOTPStatus | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [secret, setSecret] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [step, setStep] = useState<'status' | 'setup' | 'verify'>('status');

    const fetchTOTPStatus = useCallback(async () => {
        try {
            const response = await fetch('/api/user/totp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'status' }),
            });

            const data = await response.json();
            if (data.success) {
                setTotpStatus(data.data);
            } else {
                toast.error('Failed to fetch TOTP status');
            }
        } catch (error) {
            console.error('Error fetching TOTP status:', error);
            toast.error('Error fetching TOTP status');
        }
    }, []);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || !('role' in session.user) || session.user.role !== 'user') {
            router.push('/auth/user/login');
            return;
        }

        fetchTOTPStatus();
    }, [session, status, router, fetchTOTPStatus]);

    // Auto-start TOTP setup for required users
    useEffect(() => {
        if (isRequired && totpStatus && !totpStatus.enabled) {
            const timer = setTimeout(() => {
                setStep('setup');
                setupTOTP();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isRequired, totpStatus]);

    const setupTOTP = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/user/totp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'setup' }),
            });

            const data = await response.json();
            if (data.success) {
                setQrCodeUrl(data.data.qrCodeDataUrl);
                setSecret(data.data.secret);
                setStep('setup');
                toast.success(
                    'TOTP setup initiated. Scan the QR code with your authenticator app.'
                );
            } else {
                toast.error(data.error || 'Failed to setup TOTP');
            }
        } catch (error) {
            console.error('Error setting up TOTP:', error);
            toast.error('Error setting up TOTP');
        } finally {
            setIsLoading(false);
        }
    };

    const enableTOTP = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/user/totp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'enable', totpToken: verificationCode }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('TOTP enabled successfully!');
                setStep('status');
                setVerificationCode('');
                await fetchTOTPStatus();

                // Update the session to reflect the new TOTP status
                await update();

                // If TOTP setup was required, redirect to home
                if (isRequired) {
                    toast.success('Redirecting to home...');
                    setTimeout(() => {
                        router.push('/home');
                    }, 1500);
                }
            } else {
                toast.error(data.error || 'Failed to enable TOTP');
            }
        } catch (error) {
            console.error('Error enabling TOTP:', error);
            toast.error('Error enabling TOTP');
        } finally {
            setIsLoading(false);
        }
    };

    const disableTOTP = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter a valid 6-digit code to disable TOTP');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/user/totp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'disable', totpToken: verificationCode }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('TOTP disabled successfully');
                setVerificationCode('');
                await fetchTOTPStatus();

                // Update the session to reflect the new TOTP status
                await update();
            } else {
                toast.error(data.error || 'Failed to disable TOTP');
            }
        } catch (error) {
            console.error('Error disabling TOTP:', error);
            toast.error('Error disabling TOTP');
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading' || !totpStatus) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Two-Factor Authentication (TOTP)
                </h1>

                {/* Debug info - remove this in production */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Debug Info:</h3>
                        <div className="text-xs font-mono text-gray-600">
                            <div>Session Status: {status}</div>
                            <div>
                                User Role:{' '}
                                {session?.user && 'role' in session.user
                                    ? String(session.user.role)
                                    : 'undefined'}
                            </div>
                            <div>
                                TOTP Enabled (Session):{' '}
                                {session?.user && 'totpEnabled' in session.user
                                    ? String(session.user.totpEnabled)
                                    : 'undefined'}
                            </div>
                            <div>
                                Requires TOTP Setup (Session):{' '}
                                {session?.user && 'requiresTotpSetup' in session.user
                                    ? String(session.user.requiresTotpSetup)
                                    : 'undefined'}
                            </div>
                            <div>
                                TOTP Status (API):{' '}
                                {totpStatus ? JSON.stringify(totpStatus) : 'loading...'}
                            </div>
                            <div>Is Required (URL): {String(isRequired)}</div>
                        </div>
                    </div>
                )}

                {isRequired && !totpStatus.enabled && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-yellow-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Two-Factor Authentication Required
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        For enhanced security, you must set up two-factor
                                        authentication before accessing your account. Please follow
                                        the setup process below to continue.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'status' && (
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                TOTP Status
                            </h2>
                            <div className="flex items-center space-x-4">
                                <div
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        totpStatus.enabled
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {totpStatus.enabled ? 'Enabled' : 'Disabled'}
                                </div>
                                <span className="text-gray-600">
                                    TOTP is currently {totpStatus.enabled ? 'enabled' : 'disabled'}{' '}
                                    for your account
                                </span>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                What is Two-Factor Authentication?
                            </h3>
                            <p className="text-blue-800 mb-4">
                                Two-Factor Authentication (2FA) adds an extra layer of security to
                                your account. In addition to your password, you&apos;ll need to
                                enter a 6-digit code from your authenticator app when logging in.
                            </p>
                            <p className="text-blue-800">
                                Recommended apps: Google Authenticator, Microsoft Authenticator,
                                Authy
                            </p>
                        </div>

                        <div className="space-y-4">
                            {!totpStatus.enabled ? (
                                <button
                                    onClick={setupTOTP}
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isLoading
                                        ? 'Setting up...'
                                        : 'Enable Two-Factor Authentication'}
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Enter 6-digit code to disable TOTP
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={verificationCode}
                                            onChange={(e) =>
                                                setVerificationCode(
                                                    e.target.value.replace(/\D/g, '')
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="000000"
                                        />
                                    </div>
                                    <button
                                        onClick={disableTOTP}
                                        disabled={isLoading || verificationCode.length !== 6}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {isLoading
                                            ? 'Disabling...'
                                            : 'Disable Two-Factor Authentication'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 'setup' && (
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Step 1: Scan QR Code
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Scan this QR code with your authenticator app:
                            </p>
                            <div className="flex justify-center mb-4">
                                <img
                                    src={qrCodeUrl}
                                    alt="TOTP QR Code"
                                    className="border border-gray-300 rounded"
                                />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">
                                    Can&apos;t scan? Enter this code manually:
                                </p>
                                <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                                    {secret}
                                </code>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('verify')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            I&apos;ve Added the Account
                        </button>

                        <button
                            onClick={() => setStep('status')}
                            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Step 2: Verify Setup
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Enter the 6-digit code from your authenticator app to complete
                                setup:
                            </p>
                            <div>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(e) =>
                                        setVerificationCode(e.target.value.replace(/\D/g, ''))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                                    placeholder="000000"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={enableTOTP}
                                disabled={isLoading || verificationCode.length !== 6}
                                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Verifying...' : 'Complete Setup'}
                            </button>

                            <button
                                onClick={() => setStep('setup')}
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
                            >
                                Back to QR Code
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
