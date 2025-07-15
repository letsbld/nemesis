'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SideNavBar } from '../../../components/dashboard/SideNavBar';
import toast from 'react-hot-toast';

interface TOTPStatus {
    enabled: boolean;
    hasSecret: boolean;
}

export default function TOTPSetupPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [totpStatus, setTotpStatus] = useState<TOTPStatus | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [secret, setSecret] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [step, setStep] = useState<'status' | 'setup' | 'verify'>('status');

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || !('role' in session.user) || session.user.role !== 'user') {
            router.push('/auth/user/login');
            return;
        }

        fetchTOTPStatus();
    }, [session, status, router]);

    const fetchTOTPStatus = async () => {
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
    };

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
            <div className="flex h-screen">
                <SideNavBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-lg">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <SideNavBar />
            <div className="flex-1 p-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Two-Factor Authentication (TOTP)
                    </h1>

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
                                        TOTP is currently{' '}
                                        {totpStatus.enabled ? 'enabled' : 'disabled'} for your
                                        account
                                    </span>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                    What is Two-Factor Authentication?
                                </h3>
                                <p className="text-blue-800 mb-4">
                                    Two-Factor Authentication (2FA) adds an extra layer of security
                                    to your account. In addition to your password, you&apos;ll need
                                    to enter a 6-digit code from your authenticator app when logging
                                    in.
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
        </div>
    );
}
