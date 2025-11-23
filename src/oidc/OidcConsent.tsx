'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { getConsent } from './oidcApi';

/*
What you see in the browser:
- Hydra redirects here: /oidc/consent?consent_challenge=ABC
- Page shows "Processing consent…" briefly, then redirects to Hydra's redirect_to immediately.
- If something fails, an error is shown with a Retry button.
*/

function useQueryParam(name: string) {
    return useMemo(() => {
        if (typeof window === 'undefined') return '';
        return new URLSearchParams(window.location.search).get(name) || '';
    }, [name]);
}

export default function OidcConsent() {
    const consent_challenge = useQueryParam('consent_challenge');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingMessage, setProcessingMessage] = useState('Processing consent…');

    useEffect(() => {
        let cancelled = false;
        let timeoutId: NodeJS.Timeout;

        async function run() {
            if (!consent_challenge) {
                setError('Missing consent_challenge');
                setLoading(false);
                return;
            }

            // Set a longer processing message after 3 seconds
            timeoutId = setTimeout(() => {
                if (!cancelled) {
                    setProcessingMessage('Still processing consent, please wait…');
                }
            }, 3000);

            try {
                const data = await getConsent(consent_challenge);
                if (data?.redirect_to && !cancelled) {
                    clearTimeout(timeoutId);
                    setProcessingMessage('Redirecting…');
                    // Small delay to show the "Redirecting" message
                    setTimeout(() => {
                        if (!cancelled) {
                            window.location.assign(data.redirect_to);
                        }
                    }, 300);
                    return;
                }
                if (!cancelled) {
                    clearTimeout(timeoutId);
                    setError('Missing redirect_to in consent response');
                }
            } catch (e: any) {
                if (!cancelled) {
                    clearTimeout(timeoutId);
                    const errorMsg =
                        e?.data?.error || e?.error || e?.message || 'Consent processing failed';
                    setError(errorMsg);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        run();

        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [consent_challenge]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <span className="text-lg font-medium text-gray-700">
                            {processingMessage}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-pink-600 px-8 py-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">Consent Error</h3>
                            <p className="text-red-100">
                                There was an issue processing your consent
                            </p>
                        </div>
                    </div>

                    {/* Error Content */}
                    <div className="px-8 py-6">
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                                <svg
                                    className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-red-800 mb-1">
                                        Error Details
                                    </h4>
                                    <p className="text-red-700 text-sm break-words">{error}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] shadow-lg"
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                    <span>Retry</span>
                                </div>
                            </button>

                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    If the problem persists, please contact support
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Debug Info */}
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
                        <details className="text-xs">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                Technical Details
                            </summary>
                            <div className="mt-2 p-3 bg-gray-100 rounded font-mono text-xs text-gray-700 break-all">
                                <p>
                                    <strong>Consent Challenge:</strong>{' '}
                                    {consent_challenge || 'Missing'}
                                </p>
                                <p>
                                    <strong>Current URL:</strong>{' '}
                                    {typeof window !== 'undefined' ? window.location.href : 'N/A'}
                                </p>
                                <p>
                                    <strong>Error:</strong> {error}
                                </p>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
}
