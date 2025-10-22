'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { getConsent } from './oidcApi';

/*
What you see in the browser:
- Hydra redirects here: /oidc/consent?consent_challenge=ABC
- Page shows "Processing consent…" briefly, then redirects to Hydra's redirect_to.
- If something fails, an error is shown with a Retry button.
Open DevTools (F12) to see the consent challenge and redirects in console.debug logs.
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

    useEffect(() => {
        let cancelled = false;
        async function run() {
            console.debug('[OIDC] /oidc/consent invoked', {
                href: typeof window !== 'undefined' ? window.location.href : '',
                consent_challenge,
            });

            if (!consent_challenge) {
                setError('Missing consent_challenge');
                setLoading(false);
                return;
            }
            try {
                const data = await getConsent(consent_challenge);
                if (data?.redirect_to && !cancelled) {
                    console.debug('[OIDC] Redirecting to Hydra consent accept URL', {
                        redirect_to: data.redirect_to,
                    });
                    window.location.assign(data.redirect_to);
                    return;
                }
                setError('Missing redirect_to');
            } catch (e: any) {
                console.debug('[OIDC] Consent error', e);
                setError(e?.data?.error || e?.message || 'Consent failed');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        run();
        return () => {
            cancelled = true;
        };
    }, [consent_challenge]);

    if (loading)
        return (
            <div>
                Processing consent… {consent_challenge ? `(challenge: ${consent_challenge})` : ''}
            </div>
        );

    return (
        <div>
            <div style={{ color: 'red' }}>{error}</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>
                {consent_challenge ? `consent_challenge: ${consent_challenge}` : null}
            </div>
            <button onClick={() => window.location.reload()}>Retry</button>
        </div>
    );
}
