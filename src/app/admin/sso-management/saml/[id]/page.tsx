'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import { Button } from '@/components/ui/button';

type SamlServiceProvider = {
    id: string;
    name: string;
    entityId: string;
    acsUrl: string;
    sloUrl?: string;
    description?: string;
    isActive: boolean;
    attributeMapping?: Record<string, string>;
    createdAt: string;
};

export default function SamlServiceProviderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const spId = params['id'] as string;

    const [sp, setSp] = useState<SamlServiceProvider | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editAcsUrl, setEditAcsUrl] = useState('');
    const [editEntityId, setEditEntityId] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editAttributeMapping, setEditAttributeMapping] = useState('');

    useEffect(() => {
        if (!spId) return;
        fetchSpDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spId]);

    async function fetchSpDetails() {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch(`/saml/admin/sp/${spId}`);
            if (data.serviceProvider) {
                setSp(data.serviceProvider);
                // Initialize edit form
                setEditName(data.serviceProvider.name);
                setEditAcsUrl(data.serviceProvider.acsUrl);
                setEditEntityId(data.serviceProvider.entityId);
                setEditDescription(data.serviceProvider.description || '');
                setEditAttributeMapping(
                    JSON.stringify(data.serviceProvider.attributeMapping || {}, null, 2)
                );
            } else {
                setError('Service Provider not found');
            }
        } catch (e: any) {
            setError(e?.error || e?.message || 'Failed to load Service Provider details');
        } finally {
            setLoading(false);
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

    async function handleDelete() {
        if (!sp?.id) return;
        if (
            !confirm(
                'Are you sure you want to delete this Service Provider? This action cannot be undone.'
            )
        )
            return;

        try {
            await apiFetch(`/saml/admin/sp/${sp.id}`, { method: 'DELETE' });
            router.push('/admin/sso-management');
        } catch (e: any) {
            setError(e?.message || 'Failed to delete Service Provider');
        }
    }

    async function handleSave() {
        setSaving(true);
        setError(null);
        try {
            let parsedMapping;
            try {
                parsedMapping = JSON.parse(editAttributeMapping);
            } catch (e) {
                throw new Error('Invalid JSON for Attribute Mapping');
            }

            const payload = {
                name: editName,
                acsUrl: editAcsUrl,
                entityId: editEntityId,
                description: editDescription,
                attributeMapping: parsedMapping,
            };

            await apiFetch(`/saml/admin/sp/${spId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            setIsEditing(false);
            fetchSpDetails();
        } catch (e: any) {
            setError(e?.message || 'Failed to update Service Provider');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
                <div className="text-gray-600">Loading Service Provider details...</div>
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

    if (!sp) {
        return (
            <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
                <div className="text-gray-600">Service Provider not found</div>
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
                            {sp.name || 'Unnamed Service Provider'}
                        </h1>
                        <p className="text-gray-600 mt-1">SAML 2.0 Service Provider Details</p>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing && (
                            <Button onClick={() => setIsEditing(true)} variant="outline">
                                Edit Configuration
                            </Button>
                        )}
                        <Button onClick={handleDelete} variant="destructive">
                            Delete SP
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-medium mb-4">Basic Information</h2>
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <div className="text-gray-900">{sp.name}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <div className="text-gray-900">{sp.description || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SP ID
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                        {sp.id}
                                    </code>
                                    <Button
                                        onClick={() => copyToClipboard(sp.id, 'sp_id')}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        {copiedField === 'sp_id' ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Created At
                                </label>
                                <div className="text-gray-900">
                                    {new Date(sp.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <span
                                    className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                                        sp.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {sp.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* SAML Configuration */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-medium mb-4">SAML Configuration</h2>
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Entity ID
                                </label>
                                <input
                                    value={editEntityId}
                                    onChange={(e) => setEditEntityId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ACS URL
                                </label>
                                <input
                                    value={editAcsUrl}
                                    onChange={(e) => setEditAcsUrl(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Attribute Mapping (JSON)
                                </label>
                                <textarea
                                    value={editAttributeMapping}
                                    onChange={(e) => setEditAttributeMapping(e.target.value)}
                                    className="w-full min-h-32 px-3 py-2 rounded-md border border-gray-300 font-mono text-sm"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    onClick={() => setIsEditing(false)}
                                    variant="ghost"
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Entity ID
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                                        {sp.entityId}
                                    </code>
                                    <Button
                                        onClick={() => copyToClipboard(sp.entityId, 'entity_id')}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        {copiedField === 'entity_id' ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ACS URL
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                                        {sp.acsUrl}
                                    </code>
                                    <Button
                                        onClick={() => copyToClipboard(sp.acsUrl, 'acs_url')}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        {copiedField === 'acs_url' ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Attribute Mapping
                                </label>
                                <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-40 border border-gray-200">
                                    {JSON.stringify(sp.attributeMapping, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export const runtime = 'edge';