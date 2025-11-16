'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    createOidcClient,
    deleteOidcClient,
    listOidcClients,
    type OidcClient,
} from '@/lib/oidcAdmin';

type Provider = 'OIDC' | 'SAML2';

export default function SsoManagementPage() {
    const router = useRouter();
    const [provider, setProvider] = useState<Provider>('OIDC'); // for now we show only OIDC flows
    const [apps, setApps] = useState<OidcClient[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create form (OIDC only for now)
    const [clientName, setClientName] = useState('');
    const [clientType, setClientType] = useState<'public' | 'confidential'>('public');
    const [redirectUris, setRedirectUris] = useState('');
    const [postLogoutUris, setPostLogoutUris] = useState('');
    const [scope, setScope] = useState('openid offline');
    const [saving, setSaving] = useState(false);
    const [createResponse, setCreateResponse] = useState<any | null>(null);
    const [productionEndpoints, setProductionEndpoints] = useState<any | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const redirectUrisArray = useMemo(
        () =>
            redirectUris
                .split(/\s|,|\n/)
                .map((s) => s.trim())
                .filter(Boolean),
        [redirectUris]
    );
    const postLogoutUrisArray = useMemo(
        () =>
            postLogoutUris
                .split(/\s|,|\n/)
                .map((s) => s.trim())
                .filter(Boolean),
        [postLogoutUris]
    );

    async function refresh() {
        setLoading(true);
        setError(null);
        try {
            // For now provider filter is OIDC
            const list = await listOidcClients();
            setApps(list);
        } catch (e: any) {
            setError(e?.error || e?.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function onCreate(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (provider !== 'OIDC') {
                // Placeholder: in future, wire SAML creation flow
                throw new Error('Only OIDC creation is supported for now');
            }
            const payload: OidcClient = {
                client_name: clientName,
                redirect_uris: redirectUrisArray,
                post_logout_redirect_uris: postLogoutUrisArray.length
                    ? postLogoutUrisArray
                    : undefined,
                grant_types: ['authorization_code', 'refresh_token'],
                response_types: ['code', 'id_token'],
                scope,
                token_endpoint_auth_method:
                    clientType === 'public' ? 'none' : 'client_secret_basic',
            };
            const res = await createOidcClient(payload);
            // normalize response: api may return { client: {...} } or the client object directly
            const created = res?.client ?? res?.data ?? res;
            const production_endpoints = res?.production_endpoints || {};
            setCreateResponse(created);
            setProductionEndpoints(production_endpoints);

            // keep form values cleared so admin can create another if needed
            setClientName('');
            setRedirectUris('');
            setPostLogoutUris('');
            setScope('openid offline');
            setClientType('public');
            await refresh();
        } catch (e: any) {
            setError(e?.error || e?.message || 'Failed to create application');
        } finally {
            setSaving(false);
        }
    }

    async function copyToClipboard(text: string, field: string) {
        try {
            await navigator.clipboard.writeText(text || '');
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            // ignore
        }
    }

    async function onDelete(id?: string) {
        if (!id) return;
        if (!confirm('Delete this application?')) return;
        try {
            await deleteOidcClient(id);
            await refresh();
        } catch (e) {
            // ignore
        }
    }

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-gray-900">
            <h1 className="text-2xl font-semibold">SSO Applications</h1>
            <p className="text-gray-700 mt-1">
                Create and manage SSO apps. Provider selection includes SAML 2.0 and OIDC;
                currently, creation supports OIDC.
            </p>

            {/* Create form */}
            <div className="mt-6 bg-white rounded-xl shadow p-5 max-w-3xl">
                <h2 className="text-lg font-medium mb-4">Add Application</h2>
                <form onSubmit={onCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            Provider
                        </label>
                        <div className="flex gap-3">
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="provider"
                                    value="OIDC"
                                    checked={provider === 'OIDC'}
                                    onChange={() => setProvider('OIDC')}
                                />
                                <span>OIDC</span>
                            </label>
                            <label
                                className="inline-flex items-center gap-2 opacity-60 cursor-not-allowed"
                                title="SAML support coming soon"
                            >
                                <input
                                    type="radio"
                                    name="provider"
                                    value="SAML2"
                                    disabled
                                    checked={provider === 'SAML2'}
                                    onChange={() => setProvider('SAML2')}
                                />
                                <span className="text-gray-700">SAML 2.0</span>
                            </label>
                        </div>
                    </div>

                    {/* OIDC fields */}
                    {provider === 'OIDC' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Application Name
                                </label>
                                <input
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-gray-900 placeholder-gray-500"
                                    placeholder="My OIDC App"
                                />
                            </div>

                            <div>
                                <span className="block text-sm font-medium text-gray-900 mb-1">
                                    Client Type
                                </span>
                                <div className="flex gap-4">
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="ctype"
                                            checked={clientType === 'public'}
                                            onChange={() => setClientType('public')}
                                        />
                                        <span>Public (no client secret)</span>
                                    </label>
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="ctype"
                                            checked={clientType === 'confidential'}
                                            onChange={() => setClientType('confidential')}
                                        />
                                        <span>Confidential (client secret)</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Redirect URIs
                                </label>
                                <textarea
                                    value={redirectUris}
                                    onChange={(e) => setRedirectUris(e.target.value)}
                                    className="w-full min-h-20 px-3 py-2 rounded-md border border-gray-200 text-gray-900 placeholder-gray-500"
                                    placeholder="One per line or comma separated"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    Example: https://example.com/oauth2/callback
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Post-Logout Redirect URIs (optional)
                                </label>
                                <textarea
                                    value={postLogoutUris}
                                    onChange={(e) => setPostLogoutUris(e.target.value)}
                                    className="w-full min-h-20 px-3 py-2 rounded-md border border-gray-200 text-gray-900 placeholder-gray-500"
                                    placeholder="One per line or comma separated"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Scopes
                                </label>
                                <input
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-gray-900 placeholder-gray-500"
                                    placeholder="openid offline profile email"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    Space-separated scopes. Defaults: openid offline
                                </p>
                            </div>
                        </>
                    )}

                    {error && <div className="bg-red-50 text-red-700 p-3 rounded-md">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium disabled:opacity-50"
                        >
                            {saving ? 'Creating...' : 'Create Application'}
                        </button>
                    </div>
                </form>

                {createResponse && (
                    <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-md">
                        <div className="flex items-start gap-2 mb-2">
                            <div className="w-5 h-5 text-green-600 mt-0.5">✓</div>
                            <div>
                                <h3 className="text-sm font-medium text-green-800">
                                    Application created successfully!
                                </h3>
                                <p className="text-xs text-green-700 mt-1">
                                    Click on the application name or ID below to view details.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-700">Client ID</div>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono text-xs text-gray-800">
                                        {createResponse.client_id || createResponse.id || '-'}
                                    </code>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                createResponse.client_id || createResponse.id || '',
                                                'client_id'
                                            )
                                        }
                                        className="text-sm text-indigo-600 hover:underline"
                                    >
                                        {copiedField === 'client_id' ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            {createResponse.client_secret && (
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-700">Client Secret</div>
                                    <div className="flex items-center gap-2">
                                        <code className="font-mono text-xs text-gray-800">
                                            {createResponse.client_secret}
                                        </code>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    createResponse.client_secret,
                                                    'client_secret'
                                                )
                                            }
                                            className="text-sm text-indigo-600 hover:underline"
                                        >
                                            {copiedField === 'client_secret' ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {createResponse.registration_access_token && (
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-700">
                                        Registration Access Token
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <code className="font-mono text-xs text-gray-800">
                                            {createResponse.registration_access_token}
                                        </code>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    createResponse.registration_access_token,
                                                    'registration_access_token'
                                                )
                                            }
                                            className="text-sm text-indigo-600 hover:underline"
                                        >
                                            {copiedField === 'registration_access_token'
                                                ? 'Copied'
                                                : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {createResponse.registration_client_uri && (
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-700">
                                        Registration Client URI
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            className="text-xs text-indigo-600 hover:underline max-w-xs break-all"
                                            href={createResponse.registration_client_uri}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {createResponse.registration_client_uri}
                                        </a>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    createResponse.registration_client_uri,
                                                    'registration_client_uri'
                                                )
                                            }
                                            className="text-sm text-indigo-600 hover:underline"
                                        >
                                            {copiedField === 'registration_client_uri'
                                                ? 'Copied'
                                                : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {createResponse.production_endpoints && (
                                <div className="mt-2">
                                    <div className="text-xs text-gray-700 mb-2 font-medium">
                                        Production Endpoints
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 text-xs">
                                        {Object.entries(createResponse.production_endpoints).map(
                                            ([k, v]) => (
                                                <div
                                                    key={k}
                                                    className="border-l-2 border-gray-200 pl-3"
                                                >
                                                    <div className="text-gray-600 font-medium capitalize mb-1">
                                                        {k.replace(/_/g, ' ')}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={String(v)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-indigo-600 hover:underline break-all font-mono text-xs bg-gray-50 px-2 py-1 rounded"
                                                        >
                                                            {String(v)}
                                                        </a>
                                                        <button
                                                            onClick={() =>
                                                                copyToClipboard(
                                                                    String(v),
                                                                    `endpoint_${k}`
                                                                )
                                                            }
                                                            className="text-sm text-indigo-600 hover:underline whitespace-nowrap"
                                                        >
                                                            {copiedField === `endpoint_${k}`
                                                                ? 'Copied'
                                                                : 'Copy'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <details className="text-xs">
                                    <summary className="cursor-pointer text-sm text-gray-700">
                                        Full response
                                    </summary>
                                    <pre className="mt-2 max-h-48 overflow-auto text-xs bg-white p-2 rounded border">
                                        {JSON.stringify(createResponse, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="mt-8 bg-white rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Applications</h2>
                    <button onClick={refresh} className="text-sm text-indigo-600 hover:underline">
                        Refresh
                    </button>
                </div>
                {loading ? (
                    <div className="text-gray-600">Loading...</div>
                ) : apps.length === 0 ? (
                    <div className="text-gray-600">No applications found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-700 border-b">
                                    <th className="py-2 pr-4 font-medium">Name</th>
                                    <th className="py-2 pr-4 font-medium">Client ID</th>
                                    <th className="py-2 pr-4 font-medium">Type</th>
                                    <th className="py-2 pr-4 font-medium">Redirect URIs</th>
                                    <th className="py-2 pr-4 font-medium">Scopes</th>
                                    <th className="py-2 pr-4 font-medium">Created</th>
                                    <th className="py-2 pr-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apps.map((c) => (
                                    <tr
                                        key={c.id || c.client_id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="py-3 pr-4 text-gray-900">
                                            <Link
                                                href={`/admin/sso-management/${encodeURIComponent(
                                                    c.client_id || c.id || ''
                                                )}`}
                                                className="text-indigo-600 hover:underline"
                                            >
                                                {c.client_name || '-'}
                                            </Link>
                                        </td>
                                        <td className="py-3 pr-4 font-mono text-gray-800 text-xs">
                                            <Link
                                                href={`/admin/sso-management/${encodeURIComponent(
                                                    c.client_id || c.id || ''
                                                )}`}
                                                className="text-indigo-600 hover:underline"
                                            >
                                                {c.client_id || c.id}
                                            </Link>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                                    c.token_endpoint_auth_method === 'none'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-purple-100 text-purple-800'
                                                }`}
                                            >
                                                {c.token_endpoint_auth_method === 'none'
                                                    ? 'Public'
                                                    : 'Confidential'}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 max-w-xs">
                                            <div className="text-gray-700 break-all text-xs">
                                                {(c.redirect_uris || []).join(', ') || '-'}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4 text-gray-700 text-xs max-w-xs">
                                            {c.scope || '-'}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600 text-xs">
                                            {c.created_at
                                                ? new Date(c.created_at).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <button
                                                onClick={() => onDelete(c.id || c.client_id || '')}
                                                className="text-sm text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
