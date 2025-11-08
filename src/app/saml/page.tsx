// app/saml/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import LoginCard from '@/saml/LoginCard';
import { apiFetch } from '@/lib/apiFetch';

/**
 * SP-initiated landing page for IdP sign-in.
 * Uses your apiFetch (stringify body + set headers).
 */

export default function IdpSsoPage() {
    const [rawSAMLRequest, setRawSAMLRequest] = useState<string | null>(null);
    const [relayState, setRelayState] = useState<string | null>(null);
    const [parsed, setParsed] = useState<{
        acsUrl?: string;
        requestId?: string;
        issuer?: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extract raw params on client-side from window.location.href to preserve encoding
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const href = window.location.href;
        const qIndex = href.indexOf('?');
        if (qIndex === -1) {
            setError('No query string found in URL');
            return;
        }
        const rawQs = href.slice(qIndex + 1);
        const samlMatch = rawQs.match(/(?:^|&)SAMLRequest=([^&]*)/);
        const relayMatch = rawQs.match(/(?:^|&)RelayState=([^&]*)/);

        if (!samlMatch || !samlMatch[1]) {
            setError('Missing SAMLRequest parameter in URL');
            return;
        }

        // Recover '+' that may have been converted to spaces
        let encoded = samlMatch[1].replace(/ /g, '+');

        setRawSAMLRequest(encoded);

        if (relayMatch && relayMatch[1]) {
            const r = relayMatch[1].replace(/ /g, '+');
            try {
                setRelayState(decodeURIComponent(r));
            } catch {
                setRelayState(r);
            }
        }
    }, []);

    // parse the AuthnRequest using backend (optional but useful to show SP info)
    useEffect(() => {
        if (!rawSAMLRequest) return;
        (async () => {
            setError(null);
            try {
                const res = await apiFetch('/saml/idp/parse-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ SAMLRequest: rawSAMLRequest }),
                });
                // apiFetch throws for non-ok; assume success response shape
                setParsed({ acsUrl: res.acsUrl, requestId: res.requestId, issuer: res.issuer });
            } catch (err: any) {
                // apiFetch throws objects like { error, status } or network errors
                const msg =
                    typeof err === 'string'
                        ? err
                        : err?.error || err?.message || 'Failed to parse SAMLRequest';
                setError(msg);
            }
        })();
    }, [rawSAMLRequest]);

    const handleAuthSubmit = async (creds: { username: string; password: string }) => {
        setLoading(true);
        setError(null);
        try {
            const body = {
                username: creds.username,
                password: creds.password,
                SAMLRequest: rawSAMLRequest || undefined,
                RelayState: relayState || undefined,
                acsUrl: parsed?.acsUrl,
                requestId: parsed?.requestId,
            };

            const res = await apiFetch('/saml/idp/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            // Expect { success: true, samlResponse, acsUrl, RelayState? }
            if (!res || !res.success) {
                throw res || { error: 'Authentication failed' };
            }

            const formHtml = `
        <form id="samlForm" method="POST" action="${res.acsUrl}">
          <input type="hidden" name="SAMLResponse" value="${res.samlResponse}" />
          <input type="hidden" name="RelayState" value="${res.RelayState || ''}" />
        </form>
        <script>document.getElementById('samlForm').submit();</script>
      `;

            window.document.open();
            window.document.write(formHtml);
            window.document.close();
        } catch (err: any) {
            const msg =
                typeof err === 'string' ? err : err?.error || err?.message || 'Login failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                minHeight: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f6f7fb',
            }}
        >
            <LoginCard
                spName={parsed?.issuer || null}
                acsHint={parsed?.acsUrl || null}
                onSubmit={handleAuthSubmit}
                loading={loading}
                error={error}
            />
        </div>
    );
}
