'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ServiceProvider {
    id: string;
    name: string;
    entityId: string;
    assertEndpoint: string;
    enabled: boolean;
    description: string;
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

export default function SSOManagementPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'providers' | 'policies' | 'audit'>('providers');
    const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
    const [policies, setPolicies] = useState<DLPPolicy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user || (session.user as any).role !== 'admin') {
            router.push('/auth/login');
            return;
        }

        loadData();
    }, [session, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load service providers and policies
            // In a real implementation, these would come from API endpoints
            setServiceProviders([
                {
                    id: 'aws',
                    name: 'Amazon Web Services',
                    entityId: 'urn:amazon:webservices',
                    assertEndpoint: 'https://signin.aws.amazon.com/saml',
                    enabled: true,
                    description: 'AWS Management Console access via SAML 2.0',
                },
                {
                    id: 'gworkspace',
                    name: 'Google Workspace',
                    entityId: 'google.com',
                    assertEndpoint: 'https://accounts.google.com/saml2/consume',
                    enabled: false,
                    description: 'Google Workspace applications (Gmail, Drive, etc.)',
                },
                {
                    id: 'office365',
                    name: 'Microsoft 365',
                    entityId: 'urn:federation:MicrosoftOnline',
                    assertEndpoint: 'https://login.microsoftonline.com/saml2',
                    enabled: false,
                    description: 'Microsoft 365 applications and services',
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

    const generateMetadata = () => {
        const metadata = `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="${process.env.NEXTAUTH_URL}/saml/metadata">
  <md:IDPSSODescriptor WantAuthnRequestsSigned="false"
                       protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                            Location="${process.env.NEXTAUTH_URL}/api/saml/sso/protected-login"/>
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                            Location="${process.env.NEXTAUTH_URL}/api/saml/sso/protected-login"/>
  </md:IDPSSODescriptor>
</md:EntityDescriptor>`;

        const blob = new Blob([metadata], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dlp-idp-metadata.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading SSO Management...</div>
            </div>
        );
    }

    return (
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
                            onClick={() => setActiveTab(tab.id as any)}
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
                                onClick={generateMetadata}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                📥 Download Metadata
                            </button>
                            <a
                                href="/test/saml"
                                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                            >
                                🧪 Test IdP
                            </a>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                ➕ Add Provider
                            </button>
                        </div>
                    </div>

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
                                                    provider.enabled
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {provider.enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </h3>
                                        <p className="text-gray-600 mt-1">{provider.description}</p>
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

                                {provider.id === 'aws' && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                                        <h4 className="font-medium text-blue-900 mb-2">
                                            🔧 AWS Configuration
                                        </h4>
                                        <p className="text-sm text-blue-800 mb-2">
                                            To configure AWS to use this Identity Provider:
                                        </p>
                                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                            <li>Download the metadata file above</li>
                                            <li>
                                                Go to AWS IAM → Identity Providers → Create Provider
                                            </li>
                                            <li>Choose SAML and upload the metadata file</li>
                                            <li>
                                                Create IAM roles with the SAML provider as trusted
                                                entity
                                            </li>
                                        </ol>
                                        <div className="mt-3 p-2 bg-blue-100 rounded text-xs font-mono">
                                            SSO URL: {process.env.NEXTAUTH_URL}
                                            /api/saml/sso/protected-login
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
                                        <p className="text-gray-600 mt-1">{policy.description}</p>
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
                                    Access requests will appear here once users start authenticating
                                    through the IdP
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
