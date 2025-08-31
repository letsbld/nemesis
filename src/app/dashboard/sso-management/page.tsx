'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PrivateRoute } from '@/components/PrivateRoute';

interface ServiceProvider {
    id: string;
    name: string;
    protocol: 'SAML' | 'OIDC';
    enabled: boolean;
    description: string;
    // SAML specific fields
    entityId?: string;
    assertEndpoint?: string;
    // OIDC specific fields
    clientId?: string;
    clientSecret?: string;
    redirectUris?: string[];
    scopes?: string[];
    grantTypes?: string[];
    // Common metadata
    metadata?: string;
}

interface DLPPolicy {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    priority: number;
    conditions: any[];
    actions: any[];
}

function SSOManagementPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'providers' | 'policies' | 'audit'>('providers');
    const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
    const [policies, setPolicies] = useState<DLPPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddProvider, setShowAddProvider] = useState(false);
    const [newProvider, setNewProvider] = useState({
        name: '',
        protocol: 'SAML' as 'SAML' | 'OIDC',
        description: '',
        enabled: true,
        // SAML fields
        entityId: '',
        assertEndpoint: '',
        // OIDC fields
        clientId: '',
        clientSecret: '',
        redirectUris: [''],
        scopes: ['openid', 'profile', 'email'],
        grantTypes: ['authorization_code'],
    });

    useEffect(() => {
        // Set initial tab based on URL parameter, default to 'providers'
        const tabParam = searchParams.get('tab');
        if (tabParam && ['providers', 'policies', 'audit'].includes(tabParam)) {
            setActiveTab(tabParam as 'providers' | 'policies' | 'audit');
        } else {
            setActiveTab('providers');
        }

        loadData();
    }, [router, searchParams]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load service providers and policies
            // In a real implementation, these would come from API endpoints
            setServiceProviders([
                {
                    id: 'aws-saml',
                    name: 'Amazon Web Services (SAML)',
                    protocol: 'SAML',
                    entityId: 'urn:amazon:webservices',
                    assertEndpoint: 'https://signin.aws.amazon.com/saml',
                    enabled: true,
                    description: 'AWS Management Console access via SAML 2.0',
                },
                {
                    id: 'aws-oidc',
                    name: 'Amazon Web Services (OIDC)',
                    protocol: 'OIDC',
                    clientId: 'aws-console-client',
                    redirectUris: ['https://signin.aws.amazon.com/oauth/callback'],
                    scopes: ['openid', 'profile', 'email'],
                    grantTypes: ['authorization_code'],
                    enabled: false,
                    description: 'AWS Management Console access via OpenID Connect',
                },
                {
                    id: 'gworkspace',
                    name: 'Google Workspace',
                    protocol: 'SAML',
                    entityId: 'google.com',
                    assertEndpoint: 'https://accounts.google.com/saml2/consume',
                    enabled: false,
                    description: 'Google Workspace applications (Gmail, Drive, etc.)',
                },
                {
                    id: 'office365-oidc',
                    name: 'Microsoft 365 (OIDC)',
                    protocol: 'OIDC',
                    clientId: 'office365-client',
                    redirectUris: ['https://login.microsoftonline.com/oauth/callback'],
                    scopes: ['openid', 'profile', 'email'],
                    grantTypes: ['authorization_code'],
                    enabled: false,
                    description: 'Microsoft 365 applications via OpenID Connect',
                },
            ]);

            setPolicies([
                {
                    id: 'aws-admin-access',
                    name: 'AWS Admin Access Policy',
                    description: 'Require MFA for AWS admin role access',
                    enabled: true,
                    priority: 1,
                    conditions: [],
                    actions: [],
                },
                {
                    id: 'untrusted-device-block',
                    name: 'Untrusted Device Block',
                    description: 'Block access from untrusted devices',
                    enabled: true,
                    priority: 2,
                    conditions: [],
                    actions: [],
                },
            ]);
        } catch (error) {
            console.error('Failed to load SSO data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab: 'providers' | 'policies' | 'audit') => {
        setActiveTab(tab);
        // Update URL with tab parameter
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        router.push(url.pathname + '?' + url.searchParams.toString(), { scroll: false });
    };

    const handleAddProvider = async () => {
        try {
            const providerId = newProvider.name.toLowerCase().replace(/\s+/g, '-');
            const provider: ServiceProvider = {
                id: providerId,
                ...newProvider,
                redirectUris: newProvider.redirectUris.filter((uri) => uri.trim() !== ''),
            };

            // In production, save to API
            setServiceProviders((prev) => [...prev, provider]);
            setShowAddProvider(false);
            setNewProvider({
                name: '',
                protocol: 'SAML',
                description: '',
                enabled: true,
                entityId: '',
                assertEndpoint: '',
                clientId: '',
                clientSecret: '',
                redirectUris: [''],
                scopes: ['openid', 'profile', 'email'],
                grantTypes: ['authorization_code'],
            });
        } catch (error) {
            console.error('Failed to add provider:', error);
        }
    };

    const addRedirectUri = () => {
        setNewProvider((prev) => ({
            ...prev,
            redirectUris: [...prev.redirectUris, ''],
        }));
    };

    const updateRedirectUri = (index: number, value: string) => {
        setNewProvider((prev) => ({
            ...prev,
            redirectUris: prev.redirectUris.map((uri, i) => (i === index ? value : uri)),
        }));
    };

    const generateMetadata = (protocol: 'SAML' | 'OIDC' = 'SAML') => {
        let metadata: string;
        let filename: string;
        let mimeType: string;

        if (protocol === 'SAML') {
            metadata = `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="${process.env.NEXT_PUBLIC_API_BASE_URL}/saml/metadata">
  <md:IDPSSODescriptor WantAuthnRequestsSigned="false"
                       protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                            Location="${process.env.NEXT_PUBLIC_API_BASE_URL}/api/saml/sso/protected-login"/>
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                            Location="${process.env.NEXT_PUBLIC_API_BASE_URL}/api/saml/sso/protected-login"/>
  </md:IDPSSODescriptor>
</md:EntityDescriptor>`;
            filename = 'dlp-idp-metadata.xml';
            mimeType = 'application/xml';
        } else {
            metadata = JSON.stringify(
                {
                    issuer: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
                    authorization_endpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/oidc/auth`,
                    token_endpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/oidc/token`,
                    userinfo_endpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/oidc/userinfo`,
                    jwks_uri: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/oidc/jwks`,
                    scopes_supported: ['openid', 'profile', 'email'],
                    response_types_supported: ['code', 'id_token', 'token'],
                    grant_types_supported: ['authorization_code', 'implicit'],
                    subject_types_supported: ['public'],
                    id_token_signing_alg_values_supported: ['RS256'],
                },
                null,
                2
            );
            filename = 'oidc-discovery.json';
            mimeType = 'application/json';
        }

        const blob = new Blob([metadata], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Loading state for data only
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading SSO Management...</div>
            </div>
        );
    }

    return (
        <PrivateRoute allowedRoles={['admin']}>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        SSO Identity Provider & DLP Management
                    </h1>
                    <p className="text-gray-600">
                        Manage SAML service providers, DLP policies, and audit access requests
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'providers', label: 'Service Providers', icon: '🔗' },
                            { id: 'policies', label: 'DLP Policies', icon: '🛡️' },
                            { id: 'audit', label: 'Audit Log', icon: '📊' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as any)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Service Providers Tab */}
                {activeTab === 'providers' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Service Providers</h2>
                            <div className="space-x-3">
                                <button
                                    onClick={() => generateMetadata('SAML')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    📥 SAML Metadata
                                </button>
                                <button
                                    onClick={() => generateMetadata('OIDC')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    📥 OIDC Discovery
                                </button>
                                <a
                                    href="/test/saml"
                                    className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                >
                                    🧪 Test SAML
                                </a>
                                <a
                                    href="/test/oidc"
                                    className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                >
                                    🧪 Test OIDC
                                </a>
                                <button
                                    onClick={() => setShowAddProvider(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    ➕ Add Provider
                                </button>
                            </div>
                        </div>

                        {/* Add Provider Modal */}
                        {showAddProvider && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <h3 className="text-lg font-semibold mb-4">
                                        Add Service Provider
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                value={newProvider.name}
                                                onChange={(e) =>
                                                    setNewProvider((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., AWS Production"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Protocol
                                            </label>
                                            <select
                                                value={newProvider.protocol}
                                                onChange={(e) =>
                                                    setNewProvider((prev) => ({
                                                        ...prev,
                                                        protocol: e.target.value as 'SAML' | 'OIDC',
                                                    }))
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="SAML">SAML 2.0</option>
                                                <option value="OIDC">OpenID Connect</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={newProvider.description}
                                                onChange={(e) =>
                                                    setNewProvider((prev) => ({
                                                        ...prev,
                                                        description: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows={2}
                                                placeholder="Description of this service provider"
                                            />
                                        </div>

                                        {newProvider.protocol === 'SAML' ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Entity ID
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newProvider.entityId}
                                                        onChange={(e) =>
                                                            setNewProvider((prev) => ({
                                                                ...prev,
                                                                entityId: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="urn:amazon:webservices"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Assertion Consumer Service URL
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={newProvider.assertEndpoint}
                                                        onChange={(e) =>
                                                            setNewProvider((prev) => ({
                                                                ...prev,
                                                                assertEndpoint: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="https://signin.aws.amazon.com/saml"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Client ID
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newProvider.clientId}
                                                        onChange={(e) =>
                                                            setNewProvider((prev) => ({
                                                                ...prev,
                                                                clientId: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="client-id-123"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Client Secret
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={newProvider.clientSecret}
                                                        onChange={(e) =>
                                                            setNewProvider((prev) => ({
                                                                ...prev,
                                                                clientSecret: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="client-secret"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Redirect URIs
                                                    </label>
                                                    {newProvider.redirectUris.map((uri, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex gap-2 mb-2"
                                                        >
                                                            <input
                                                                type="url"
                                                                value={uri}
                                                                onChange={(e) =>
                                                                    updateRedirectUri(
                                                                        index,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="https://example.com/callback"
                                                            />
                                                            {newProvider.redirectUris.length >
                                                                1 && (
                                                                <button
                                                                    onClick={() =>
                                                                        setNewProvider((prev) => ({
                                                                            ...prev,
                                                                            redirectUris:
                                                                                prev.redirectUris.filter(
                                                                                    (_, i) =>
                                                                                        i !== index
                                                                                ),
                                                                        }))
                                                                    }
                                                                    className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={addRedirectUri}
                                                        className="text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        + Add Redirect URI
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            onClick={() => setShowAddProvider(false)}
                                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddProvider}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Add Provider
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-6">
                            {serviceProviders.map((provider) => (
                                <div
                                    key={provider.id}
                                    className="bg-white p-6 rounded-lg border shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center">
                                                {provider.name}
                                                <span
                                                    className={`ml-3 px-2 py-1 text-xs rounded-full ${
                                                        provider.protocol === 'SAML'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}
                                                >
                                                    {provider.protocol}
                                                </span>
                                                <span
                                                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                                        provider.enabled
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {provider.enabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </h3>
                                            <p className="text-gray-600 mt-1">
                                                {provider.description}
                                            </p>
                                        </div>
                                        <div className="space-x-2">
                                            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                                                Edit
                                            </button>
                                            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                                                Test
                                            </button>
                                        </div>
                                    </div>

                                    {provider.protocol === 'SAML' ? (
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">
                                                    Entity ID:
                                                </span>
                                                <p className="text-gray-600 font-mono">
                                                    {provider.entityId}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">
                                                    Assertion Endpoint:
                                                </span>
                                                <p className="text-gray-600 font-mono break-all">
                                                    {provider.assertEndpoint}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">
                                                    Client ID:
                                                </span>
                                                <p className="text-gray-600 font-mono">
                                                    {provider.clientId}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">
                                                    Redirect URIs:
                                                </span>
                                                <div className="text-gray-600">
                                                    {provider.redirectUris?.map((uri, index) => (
                                                        <p
                                                            key={index}
                                                            className="font-mono text-xs break-all"
                                                        >
                                                            {uri}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">
                                                    Scopes:
                                                </span>
                                                <p className="text-gray-600">
                                                    {provider.scopes?.join(', ')}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">
                                                    Grant Types:
                                                </span>
                                                <p className="text-gray-600">
                                                    {provider.grantTypes?.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {provider.id === 'aws-saml' && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                                            <h4 className="font-medium text-blue-900 mb-2">
                                                🔧 AWS SAML Configuration
                                            </h4>
                                            <p className="text-sm text-blue-800 mb-2">
                                                To configure AWS to use this SAML Identity Provider:
                                            </p>
                                            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                                <li>Download the SAML metadata file above</li>
                                                <li>
                                                    Go to AWS IAM → Identity Providers → Create
                                                    Provider
                                                </li>
                                                <li>Choose SAML and upload the metadata file</li>
                                                <li>
                                                    Create IAM roles with the SAML provider as
                                                    trusted entity
                                                </li>
                                            </ol>
                                            <div className="mt-3 p-2 bg-blue-100 rounded text-xs font-mono">
                                                SSO URL: {process.env.NEXT_PUBLIC_API_BASE_URL}
                                                /api/saml/sso/protected-login
                                            </div>
                                        </div>
                                    )}

                                    {provider.id === 'aws-oidc' && (
                                        <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
                                            <h4 className="font-medium text-purple-900 mb-2">
                                                🔧 AWS OIDC Configuration
                                            </h4>
                                            <p className="text-sm text-purple-800 mb-2">
                                                To configure AWS to use this OIDC Identity Provider:
                                            </p>
                                            <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
                                                <li>Download the OIDC discovery document above</li>
                                                <li>
                                                    Go to AWS IAM → Identity Providers → Create
                                                    Provider
                                                </li>
                                                <li>
                                                    Choose OpenID Connect and enter the issuer URL
                                                </li>
                                                <li>
                                                    Add the client ID and create IAM roles with OIDC
                                                    conditions
                                                </li>
                                            </ol>
                                            <div className="mt-3 p-2 bg-purple-100 rounded text-xs font-mono space-y-1">
                                                <div>
                                                    Issuer URL:{' '}
                                                    {process.env.NEXT_PUBLIC_API_BASE_URL}
                                                </div>
                                                <div>
                                                    Authorization Endpoint:{' '}
                                                    {process.env.NEXT_PUBLIC_API_BASE_URL}
                                                    /api/oidc/auth
                                                </div>
                                                <div>
                                                    Token Endpoint:{' '}
                                                    {process.env.NEXT_PUBLIC_API_BASE_URL}
                                                    /api/oidc/token
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DLP Policies Tab */}
                {activeTab === 'policies' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">DLP Policies</h2>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                ➕ Create Policy
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {policies.map((policy) => (
                                <div
                                    key={policy.id}
                                    className="bg-white p-6 rounded-lg border shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center">
                                                {policy.name}
                                                <span
                                                    className={`ml-3 px-2 py-1 text-xs rounded-full ${
                                                        policy.enabled
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {policy.enabled ? 'Active' : 'Inactive'}
                                                </span>
                                                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                    Priority: {policy.priority}
                                                </span>
                                            </h3>
                                            <p className="text-gray-600 mt-1">
                                                {policy.description}
                                            </p>
                                        </div>
                                        <div className="space-x-2">
                                            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                                                Edit
                                            </button>
                                            <button className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Audit Log Tab */}
                {activeTab === 'audit' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Access Audit Log</h2>

                        <div className="bg-white rounded-lg border shadow-sm">
                            <div className="p-6 border-b">
                                <h3 className="font-medium">Recent Access Requests</h3>
                            </div>
                            <div className="p-6">
                                <div className="text-center text-gray-500 py-8">
                                    <p>🔍 No access requests logged yet</p>
                                    <p className="text-sm mt-2">
                                        Access requests will appear here once users start
                                        authenticating through the IdP
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PrivateRoute>
    );
}

export default function SSOManagementPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SSOManagementPageContent />
        </Suspense>
    );
}
