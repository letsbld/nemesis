'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch'; // Adjust path to your apiFetch utility
import { Loader } from '@/components/ui/loader';


export default function TotpSetupPage() {
    const router = useRouter();
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [manualEntryKey, setManualEntryKey] = useState<string | null>(null);
    
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // ✅ NEW: State to manage visibility of the manual key
    const [isManualKeyVisible, setIsManualKeyVisible] = useState(false);

    useEffect(() => {
        const fetchQrCode = async () => {
            const tempToken = sessionStorage.getItem('tempTotpToken');

            if (!tempToken) {
                console.error("No temporary token found. Redirecting to login.");
                router.replace('/auth/user/login');
                return;
            }

            try {
                // This API call is now succeeding!
                const data = await apiFetch('/user/totp/setup', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${tempToken}` },
                });

                // ✅ Correctly handle the successful response
                if (data.qrCode && data.secret) {
                    console.log("QR code and secret received:", data.qrCode, data.secret);
                    setQrCode(data.qrCode);
                    setManualEntryKey(data.secret); // Use 'secret' key from your JSON
                } else {
                   throw new Error("QR code data not found in server response.");
                }
            } catch (err: any) {
                console.error("Failed to fetch QR code:", err);
                setError("Could not start 2FA setup. Please try logging in again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchQrCode();
    }, [router]);

    const handleVerifySubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        
        const tempToken = sessionStorage.getItem('tempTotpToken');
        if (!tempToken) {
            setError("Session expired. Please log in again.");
            return;
        }

        if (verificationCode.trim().length !== 6) {
            setError("Please enter the 6-digit code from your app.");
            return;
        }

        setIsVerifying(true);
        try {
            await apiFetch('/user/totp/verify-setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tempToken}`,
                },
                body: JSON.stringify({
                    token: verificationCode,
                }),
            });

            sessionStorage.removeItem('tempTotpToken');
            sessionStorage.removeItem('pendingUserId');
            router.replace('/auth/user/login?setup_success=true');

        } catch (err: any) {
            console.error("Verification failed:", err);
            setError(err.message || "Verification failed. Check the code and try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    if (isLoading) {
        return( 
            <div className="flex justify-center py-6 min-h-screen bg-gray-50 dark:bg-[#101828] items-center">
                <Loader />
            </div>
            ) 
        }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#101828]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-[#1a2332] rounded-lg shadow-xl">
                <div className="text-center">
                    {/* ... existing code ... */}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Set Up Two-Factor Authentication</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Scan the image below with your authenticator
                        <br /> (like Google Authenticator or Authy).
                    </p>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
                        {error}
                    </div>
                )}
                
                {qrCode ? (
                    <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48" />
                        
                        <div className="mt-4 text-center w-full">
                            {/* ✅ MODIFIED: Added a flex container and a show/hide button */}
                            <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                <p>Can't scan? Enter this key manually:</p>
                                <button 
                                    type="button"
                                    onClick={() => setIsManualKeyVisible(!isManualKeyVisible)}
                                    className="ml-2 px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                                >
                                    {isManualKeyVisible ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            
                            {/* ✅ MODIFIED: Conditionally render the key or dots */}
                            <p className="p-2 mt-1 font-mono text-sm sm:text-lg break-all text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md">
                                {isManualKeyVisible ? manualEntryKey : '••••••••••••••••••••••••••••••••'}
                            </p>
                        </div>
                    </div>
                ) : (
                    !error && <p className="text-center text-gray-600 dark:text-gray-300">Generating QR Code...</p>
                )}

                <form onSubmit={handleVerifySubmit} className="space-y-4">
                    {/* ... existing code ... */}
                    <div>
                        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Verification Code
                        </label>
                        <input
                            id="verificationCode"
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                            maxLength={6}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-200 dark:bg-gray-800 dark:placeholder-gray-400"
                            placeholder="6-digit code from app"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isVerifying || !qrCode}
                        className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isVerifying ? 'Verifying...' : 'Enable Two-Factor Authentication'}
                    </button>
                </form>
            </div>
        </div>
    );
}

