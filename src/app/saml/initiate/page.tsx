// app/saml/initiate/page.tsx
'use client';
import React, { useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

export default function IdpInitiate() {
    const [form, setForm] = useState({
        username: '',
        password: '',
        acsUrl: 'https://signin.aws.amazon.com/saml',
        audience: 'urn:amazon:webservices',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const start = async (e: any) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await apiFetch('/saml/idp/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res || !res.success) throw res || { error: 'Initiate failed' };

            const html = `
        <form id="samlForm" method="POST" action="${res.acsUrl}">
          <input type="hidden" name="SAMLResponse" value="${res.samlResponse}" />
        </form>
        <script>document.getElementById('samlForm').submit();</script>
      `;
            const w = window.open('', '_blank');
            w?.document.write(html);
            w?.document.close();
        } catch (err: any) {
            const msg =
                typeof err === 'string'
                    ? err
                    : err?.error || err?.message || 'Failed to initiate SSO';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>IdP Initiated SSO</h2>
            <form onSubmit={start} style={{ maxWidth: 640 }}>
                <input
                    placeholder="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                />
                <input
                    placeholder="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                />
                <input
                    placeholder="acsUrl"
                    value={form.acsUrl}
                    onChange={(e) => setForm({ ...form, acsUrl: e.target.value })}
                    required
                />
                <input
                    placeholder="audience"
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                />
                <button disabled={loading}>
                    {loading ? 'Starting...' : 'Start IdP-Initiated SSO'}
                </button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
}
