'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getOidcClient, deleteOidcClient, type OidcClient } from '@/lib/oidcAdmin';
import { Button } from '@/components/ui/button';

type ClientDetailsResponse = {
    success: boolean;
    client: OidcClient;
    production_endpoints?: {
        authorization_url: string;
        token_url: string;
        userinfo_url: string;
        discovery_url: string;
    };
};

export default function ClientDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params['id'] as string;

    const [client, setClient] = useState<OidcClient | null>(null);
    const [productionEndpoints, setProductionEndpoints] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        if (!clientId) return;

        async function fetchClient() {
            setLoading(true);
            setError(null);
            try {
                const response = await getOidcClient(decodeURIComponent(clientId));

                // Handle different response formats
                if (response?.client) {
                    setClient(response.client);
                    setProductionEndpoints(response.production_endpoints);
                } else if (response?.success && response?.data) {
                    setClient(response.data);
                    setProductionEndpoints(response.production_endpoints);
                } else {
                    setClient(response);
                }
            } catch (e: any) {
                setError(e?.error || e?.message || 'Failed to load client details');
            } finally {
                setLoading(false);
            }
        }

        fetchClient();
    }, [clientId]);

    async function copyToClipboard(text: string, field: string) {
        try {
            await navigator.clipboard.writeText(text || '');
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            // ignore
        }
    }

    async function handleDelete() {
        if (!client?.client_id && !client?.id) return;
        if (
            !confirm(
                'Are you sure you want to delete this application? This action cannot be undone.'
            )
        )
            return;

        try {
            await deleteOidcClient(client.client_id || client.id || '');
            router.push('/admin/sso-management');
        } catch (e) {
            setError('Failed to delete application');
        }
    }

    if (loading) {
        return (
            <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
                <div className="text-gray-600">Loading client details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
                <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
                <Link
                    href="/admin/sso-management"
                    className="inline-block mt-4 text-indigo-600 hover:underline"
                >
                    ← Back to Applications
                </Link>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
                <div className="text-gray-600">Client not found</div>
                <Link
                    href="/admin/sso-management"
                    className="inline-block mt-4 text-indigo-600 hover:underline"
                >
                    ← Back to Applications
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-gray-900">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/admin/sso-management"
                    className="inline-flex items-center text-indigo-600 hover:underline mb-4"
                >
                    ← Back to Applications
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {client.client_name || 'Unnamed Application'}
                        </h1>
                        <p className="text-gray-600 mt-1">OIDC Application Details</p>
                    </div>
                    <Button onClick={handleDelete} variant="destructive" size="default">
                        Delete Application
                    </Button>
                </div>
            </div>

            {/* Client Information */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-medium mb-4">Basic Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Application Name
                            </label>
                            <div className="text-gray-900">{client.client_name || '-'}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client ID
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                    {client.client_id || client.id}
                                </code>
                                <Button
                                    onClick={() =>
                                        copyToClipboard(
                                            client.client_id || client.id || '',
                                            'client_id'
                                        )
                                    }
                                    variant="ghost"
                                    size="sm"
                                >
                                    {copiedField === 'client_id' ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                        </div>

                        {client.client_secret && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Client Secret
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                        {client.client_secret}
                                    </code>
                                    <Button
                                        onClick={() =>
                                            copyToClipboard(
                                                client.client_secret || '',
                                                'client_secret'
                                            )
                                        }
                                        variant="ghost"
                                        size="sm"
                                    >
                                        {copiedField === 'client_secret' ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client Type
                            </label>
                            <span
                                className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                                    client.token_endpoint_auth_method === 'none'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                }`}
                            >
                                {client.token_endpoint_auth_method === 'none'
                                    ? 'Public'
                                    : 'Confidential'}
                            </span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Scopes
                            </label>
                            <div className="text-gray-900">{client.scope || '-'}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Created At
                            </label>
                            <div className="text-gray-900">
                                {client.created_at
                                    ? new Date(client.created_at).toLocaleString()
                                    : '-'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Updated At
                            </label>
                            <div className="text-gray-900">
                                {client.updated_at
                                    ? new Date(client.updated_at).toLocaleString()
                                    : '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuration */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-medium mb-4">Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grant Types
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {client.grant_types?.map((type, index) => (
                                    <span
                                        key={index}
                                        className="inline-block px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                                    >
                                        {type}
                                    </span>
                                )) || <span className="text-gray-500">-</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Response Types
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {client.response_types?.map((type, index) => (
                                    <span
                                        key={index}
                                        className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                                    >
                                        {type}
                                    </span>
                                )) || <span className="text-gray-500">-</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Token Endpoint Auth Method
                            </label>
                            <div className="text-gray-900">
                                {client.token_endpoint_auth_method || '-'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject Type
                            </label>
                            <div className="text-gray-900">{client.subject_type || '-'}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Skip Consent
                            </label>
                            <div className="text-gray-900">
                                {client.skip_consent ? 'Yes' : 'No'}
                            </div>
                        </div>

                        {client.client_secret_expires_at !== undefined && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Client Secret Expires
                                </label>
                                <div className="text-gray-900">
                                    {client.client_secret_expires_at === 0
                                        ? 'Never'
                                        : new Date(
                                              client.client_secret_expires_at * 1000
                                          ).toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Redirect URIs */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-medium mb-4">Redirect URIs</h2>
                    <div className="space-y-2">
                        {client.redirect_uris && client.redirect_uris.length > 0 ? (
                            client.redirect_uris.map((uri, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <code className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded flex-1">
                                        {uri}
                                    </code>
                                    <Button
                                        onClick={() =>
                                            copyToClipboard(uri, `redirect_uri_${index}`)
                                        }
                                        variant="ghost"
                                        size="sm"
                                    >
                                        {copiedField === `redirect_uri_${index}`
                                            ? 'Copied'
                                            : 'Copy'}
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500">No redirect URIs configured</div>
                        )}
                    </div>
                </div>

                {/* Post Logout Redirect URIs */}
                {client.post_logout_redirect_uris &&
                    client.post_logout_redirect_uris.length > 0 && (
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-medium mb-4">Post-Logout Redirect URIs</h2>
                            <div className="space-y-2">
                                {client.post_logout_redirect_uris.map((uri, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <code className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded flex-1">
                                            {uri}
                                        </code>
                                        <Button
                                            onClick={() =>
                                                copyToClipboard(uri, `logout_uri_${index}`)
                                            }
                                            variant="ghost"
                                            size="sm"
                                        >
                                            {copiedField === `logout_uri_${index}`
                                                ? 'Copied'
                                                : 'Copy'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                {/* Production Endpoints */}
                {productionEndpoints && (
                    <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
                        <h2 className="text-lg font-medium mb-4">Production Endpoints</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(productionEndpoints).map(([key, value]) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={String(value)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-mono text-sm text-indigo-600 hover:underline bg-gray-100 px-2 py-1 rounded flex-1 break-all"
                                        >
                                            {String(value)}
                                        </a>
                                        <Button
                                            onClick={() =>
                                                copyToClipboard(String(value), `endpoint_${key}`)
                                            }
                                            variant="ghost"
                                            size="sm"
                                        >
                                            {copiedField === `endpoint_${key}` ? 'Copied' : 'Copy'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Registration Details */}
                {(client.registration_access_token || client.registration_client_uri) && (
                    <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
                        <h2 className="text-lg font-medium mb-4">Registration Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {client.registration_access_token && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Registration Access Token
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <code className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                                            {client.registration_access_token}
                                        </code>
                                        <Button
                                            onClick={() =>
                                                copyToClipboard(
                                                    client.registration_access_token || '',
                                                    'registration_token'
                                                )
                                            }
                                            variant="ghost"
                                            size="sm"
                                        >
                                            {copiedField === 'registration_token'
                                                ? 'Copied'
                                                : 'Copy'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {client.registration_client_uri && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Registration Client URI
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={client.registration_client_uri}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-mono text-sm text-indigo-600 hover:underline bg-gray-100 px-2 py-1 rounded flex-1 break-all"
                                        >
                                            {client.registration_client_uri}
                                        </a>
                                        <Button
                                            onClick={() =>
                                                copyToClipboard(
                                                    client.registration_client_uri || '',
                                                    'registration_uri'
                                                )
                                            }
                                            variant="ghost"
                                            size="sm"
                                        >
                                            {copiedField === 'registration_uri' ? 'Copied' : 'Copy'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
