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
import { apiFetch } from '@/lib/apiFetch';

type Provider = 'OIDC' | 'SAML2';

type SamlServiceProvider = {
    id: string;
    name: string;
    entityId: string;
    acsUrl: string;
    sloUrl?: string;
    metadataUrl?: string;
    description?: string;
    isActive: boolean;
    attributeMapping?: Record<string, string>;
    createdAt: string;
    createdBy?: string;
};

type Application = OidcClient | SamlServiceProvider;

// SAML API functions
const createSamlServiceProvider = async (sp: Partial<SamlServiceProvider>, metadataFile?: File) => {
    const formData = new FormData();

    // Add all SP data to FormData
    Object.entries(sp).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (typeof value === 'object') {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        }
    });

    // Add metadata file if provided
    if (metadataFile) {
        formData.append('metadataFile', metadataFile);
    }

    return await apiFetch('/saml/admin/sp/register', {
        method: 'POST',
        body: formData,
    });
};

const listSamlServiceProviders = async (): Promise<SamlServiceProvider[]> => {
    const data = await apiFetch('/saml/admin/sp/list');
    return data.serviceProviders || [];
};

const deleteSamlServiceProvider = async (id: string) => {
    return await apiFetch(`/saml/admin/sp/${id}`, { method: 'DELETE' });
};

export default function SsoManagementPage() {
    const router = useRouter();
    const [provider, setProvider] = useState<Provider>('OIDC');
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create form - OIDC fields
    const [clientName, setClientName] = useState('');
    const [clientType, setClientType] = useState<'public' | 'confidential'>('confidential');
    const [redirectUris, setRedirectUris] = useState('');
    const [postLogoutUris, setPostLogoutUris] = useState('');
    const [scope, setScope] = useState('openid profile email');

    // Create form - SAML fields
    const [samlName, setSamlName] = useState('');
    const [entityId, setEntityId] = useState('');
    const [acsUrl, setAcsUrl] = useState('');
    const [sloUrl, setSloUrl] = useState('');
    const [metadataUrl, setMetadataUrl] = useState('');
    const [metadataFile, setMetadataFile] = useState<File | null>(null);
    const [metadataSource, setMetadataSource] = useState<'url' | 'file' | 'manual'>('manual');
    const [description, setDescription] = useState('');

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
            let allApps: Application[] = [];

            // Load OIDC clients
            try {
                const oidcClients = await listOidcClients();
                allApps = [
                    ...allApps,
                    ...oidcClients.map((app) => ({ ...app, type: 'OIDC' as const })),
                ];
            } catch (e) {
                console.error('Failed to load OIDC clients:', e);
            }

            // Load SAML Service Providers
            try {
                const samlSPs = await listSamlServiceProviders();
                allApps = [
                    ...allApps,
                    ...samlSPs.map((app) => ({ ...app, type: 'SAML2' as const })),
                ];
            } catch (e) {
                console.error('Failed to load SAML SPs:', e);
            }

            setApps(allApps);
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
            if (provider === 'OIDC') {
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

                // Clear OIDC form fields
                setClientName('');
                setRedirectUris('');
                setPostLogoutUris('');
                setScope('openid offline');
                setClientType('public');
            } else if (provider === 'SAML2') {
                const payload = {
                    name: samlName,
                    // Only include entityId and acsUrl if no metadata is provided
                    entityId: metadataSource === 'manual' ? entityId : undefined,
                    acsUrl: metadataSource === 'manual' ? acsUrl : undefined,
                    sloUrl: sloUrl || undefined,
                    metadataUrl: metadataSource === 'url' ? metadataUrl : undefined,
                    description: description || undefined,
                    isActive: true,
                    attributeMapping: {
                        email: 'email',
                        firstName: 'firstName',
                        lastName: 'lastName',
                        role: 'role',
                    },
                };
                const res = await createSamlServiceProvider(
                    payload,
                    metadataSource === 'file' && metadataFile ? metadataFile : undefined
                );
                setCreateResponse(res.serviceProvider);
                setProductionEndpoints(res.idpInfo || {});

                // Clear SAML form fields
                setSamlName('');
                setEntityId('');
                setAcsUrl('');
                setSloUrl('');
                setMetadataUrl('');
                setMetadataFile(null);
                setMetadataSource('manual');
                setDescription('');
            }

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

    async function onDelete(app: Application) {
        const appId = app.id || (app as any).client_id;
        if (!appId) return;
        if (!confirm('Delete this application?')) return;
        try {
            if ('client_id' in app || 'redirect_uris' in app) {
                // OIDC client
                await deleteOidcClient(appId);
            } else {
                // SAML Service Provider
                await deleteSamlServiceProvider(appId);
            }
            await refresh();
        } catch (e) {
            console.error('Failed to delete application:', e);
        }
    }

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-gray-900">
            <h1 className="text-2xl font-semibold">SSO Applications</h1>
            <p className="text-gray-700 mt-1">
                Create and manage SSO applications. Supports both OIDC and SAML 2.0 Service
                Providers.
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
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="provider"
                                    value="SAML2"
                                    checked={provider === 'SAML2'}
                                    onChange={() => setProvider('SAML2')}
                                />
                                <span>SAML 2.0</span>
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
                                    placeholder="Enter your Application Name"
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
                                    placeholder="openid profile email"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    Space-separated scopes. Defaults: openid offline
                                </p>
                            </div>
                        </>
                    )}

                    {/* SAML fields */}
                    {provider === 'SAML2' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Service Provider Name
                                </label>
                                <input
                                    value={samlName}
                                    onChange={(e) => setSamlName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-gray-900 placeholder-gray-500"
                                    placeholder="AWS Production, Salesforce, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Configuration Method
                                </label>
                                <div className="flex flex-col gap-2">
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="metadataSource"
                                            value="manual"
                                            checked={metadataSource === 'manual'}
                                            onChange={(e) =>
                                                setMetadataSource(e.target.value as 'manual')
                                            }
                                        />
                                        <span>Manual Configuration</span>
                                    </label>
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="metadataSource"
                                            value="url"
                                            checked={metadataSource === 'url'}
                                            onChange={(e) =>
                                                setMetadataSource(e.target.value as 'url')
                                            }
                                        />
                                        <span>Import from Metadata URL</span>
                                    </label>
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="metadataSource"
                                            value="file"
                                            checked={metadataSource === 'file'}
                                            onChange={(e) =>
                                                setMetadataSource(e.target.value as 'file')
                                            }
                                        />
                                        <span>Upload Metadata File</span>
                                    </label>
                                </div>
                            </div>

                            {metadataSource === 'file' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        Metadata File
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="file"
                                            accept=".xml,.txt"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                setMetadataFile(file || null);
                                            }}
                                            className="block w-full text-sm text-gray-900 border border-gray-200 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:border-indigo-500"
                                        />
                                        {metadataFile && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                Selected: {metadataFile.name} (
                                                {Math.round(metadataFile.size / 1024)} KB)
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-600 mt-1">
                                            Upload SP metadata XML file. Entity ID and ACS URL will
                                            be extracted automatically.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {metadataSource === 'url' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        Metadata URL
                                    </label>
                                    <input
                                        value={metadataUrl}
                                        onChange={(e) => setMetadataUrl(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-gray-900 placeholder-gray-500"
                                        placeholder="https://signin.aws.amazon.com/static/saml-metadata.xml"
                                    />
                                    <p className="text-xs text-gray-600 mt-1">
                                        Entity ID and ACS URL will be extracted from the metadata
                                        automatically.
                                    </p>
                                </div>
                            )}

                            {metadataSource === 'manual' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-1">
                                            Entity ID
                                        </label>
                                        <input
                                            value={entityId}
                                            onChange={(e) => setEntityId(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 rounded-md border border-gray-200 text-gray-900 placeholder-gray-500"
                                            placeholder="urn:amazon:webservices, https://saml.salesforce.com"
                                        />
                                        <p className="text-xs text-gray-600 mt-1">
                                            Unique identifier provided by the Service Provider
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-1">
                                            ACS URL (Assertion Consumer Service)
                                        </label>
                                        <input
                                            value={acsUrl}
                                            onChange={(e) => setAcsUrl(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 rounded-md border border-gray-200 text-gray-900 placeholder-gray-500"
                                            placeholder="https://signin.aws.amazon.com/saml"
                                        />
                                        <p className="text-xs text-gray-600 mt-1">
                                            URL where SAML responses will be sent
                                        </p>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    SLO URL (Single Logout) - Optional
                                </label>
                                <input
                                    value={sloUrl}
                                    onChange={(e) => setSloUrl(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-gray-900 placeholder-gray-500"
                                    placeholder="https://signin.aws.amazon.com/saml/logout"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    Optional logout URL. Can be provided manually or extracted from
                                    metadata.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Description - Optional
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full min-h-20 px-3 py-2 rounded-md border border-gray-200 text-gray-900 placeholder-gray-500"
                                    placeholder="Production AWS account for company SSO"
                                />
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
                                <div className="text-xs text-gray-700">
                                    {provider === 'OIDC' ? 'Client ID' : 'Service Provider ID'}
                                </div>
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

                            {provider === 'SAML2' && createResponse.entityId && (
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-700">Entity ID</div>
                                    <div className="flex items-center gap-2">
                                        <code className="font-mono text-xs text-gray-800">
                                            {createResponse.entityId}
                                        </code>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    createResponse.entityId,
                                                    'entity_id'
                                                )
                                            }
                                            className="text-sm text-indigo-600 hover:underline"
                                        >
                                            {copiedField === 'entity_id' ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {provider === 'SAML2' && createResponse.acsUrl && (
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-700">ACS URL</div>
                                    <div className="flex items-center gap-2">
                                        <code className="font-mono text-xs text-gray-800 break-all">
                                            {createResponse.acsUrl}
                                        </code>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(createResponse.acsUrl, 'acs_url')
                                            }
                                            className="text-sm text-indigo-600 hover:underline"
                                        >
                                            {copiedField === 'acs_url' ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            )}

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

                            {productionEndpoints && Object.keys(productionEndpoints).length > 0 && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="text-sm text-blue-800 mb-3 font-semibold flex items-center gap-2">
                                        <svg
                                            className="w-4 h-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm6 2a1 1 0 100-2 1 1 0 000 2z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {provider === 'OIDC'
                                            ? 'Production Endpoints'
                                            : 'IdP Information for SP Configuration'}
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {Object.entries(productionEndpoints).map(([k, v]) => (
                                            <div
                                                key={k}
                                                className="bg-white border border-blue-100 rounded-md p-3"
                                            >
                                                <div className="text-blue-700 font-medium text-sm mb-2 capitalize">
                                                    {k.replace(/_/g, ' ')}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={String(v)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex-1 text-indigo-600 hover:underline break-all font-mono text-xs bg-gray-50 px-3 py-2 rounded border"
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
                                                        className="px-3 py-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded border border-blue-200 transition-colors whitespace-nowrap"
                                                    >
                                                        {copiedField === `endpoint_${k}`
                                                            ? 'Copied!'
                                                            : 'Copy'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {provider === 'SAML2' && createResponse.metadataFile && (
                                <div className="mt-2 p-2 bg-gray-50 rounded border">
                                    <div className="text-xs font-medium text-gray-700 mb-1">
                                        Metadata File
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        📁 {createResponse.metadataFile.originalName} (
                                        {Math.round(createResponse.metadataFile.size / 1024)} KB)
                                        <br />
                                        Uploaded:{' '}
                                        {new Date(
                                            createResponse.metadataFile.uploadedAt
                                        ).toLocaleString()}
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
                                    <th className="py-2 pr-4 font-medium">Provider</th>
                                    <th className="py-2 pr-4 font-medium">ID/Entity</th>
                                    <th className="py-2 pr-4 font-medium">Type</th>
                                    <th className="py-2 pr-4 font-medium">Endpoints</th>
                                    <th className="py-2 pr-4 font-medium">Created</th>
                                    <th className="py-2 pr-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apps.map((app) => {
                                    const isOidc = 'client_id' in app || 'redirect_uris' in app;
                                    const isSaml = 'entityId' in app || 'acsUrl' in app;
                                    const appId = isOidc
                                        ? (app as any).client_id || app.id
                                        : app.id;
                                    const appName = isOidc
                                        ? (app as any).client_name
                                        : (app as any).name;

                                    return (
                                        <tr key={appId} className="border-b last:border-0">
                                            <td className="py-3 pr-4 text-gray-900">
                                                <Link
                                                    href={`/admin/sso-management/${encodeURIComponent(
                                                        appId || ''
                                                    )}`}
                                                    className="text-indigo-600 hover:underline"
                                                >
                                                    {appName || '-'}
                                                </Link>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                                        isOidc
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}
                                                >
                                                    {isOidc ? 'OIDC' : 'SAML 2.0'}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 font-mono text-gray-800 text-xs">
                                                <Link
                                                    href={`/admin/sso-management/${encodeURIComponent(
                                                        appId || ''
                                                    )}`}
                                                    className="text-indigo-600 hover:underline break-all"
                                                >
                                                    {isOidc ? appId : (app as any).entityId}
                                                </Link>
                                            </td>
                                            <td className="py-3 pr-4">
                                                {isOidc && (
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                                            (app as any)
                                                                .token_endpoint_auth_method ===
                                                            'none'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-purple-100 text-purple-800'
                                                        }`}
                                                    >
                                                        {(app as any).token_endpoint_auth_method ===
                                                        'none'
                                                            ? 'Public'
                                                            : 'Confidential'}
                                                    </span>
                                                )}
                                                {isSaml && (
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                                            (app as any).isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {(app as any).isActive
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 max-w-xs">
                                                <div className="text-gray-700 break-all text-xs">
                                                    {isOidc &&
                                                        ((app as any).redirect_uris || []).join(
                                                            ', '
                                                        )}
                                                    {isSaml && (app as any).acsUrl}
                                                    {!isOidc && !isSaml && '-'}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-600 text-xs">
                                                {(app as any).created_at || (app as any).createdAt
                                                    ? new Date(
                                                          (app as any).created_at ||
                                                              (app as any).createdAt
                                                      ).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <button
                                                    onClick={() => onDelete(app)}
                                                    className="text-sm text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
