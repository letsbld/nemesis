'use client';

import React, { useEffect, useState } from 'react';
import { Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Modal, ModalHeader, ModalBody, ModalFooter, Label, TextInput, ToggleSwitch, Spinner, Alert } from 'flowbite-react';
import { HiPlus, HiTrash, HiPencil, HiRefresh, HiCheck, HiX, HiCloud } from 'react-icons/hi';
import { apiFetch } from '@/lib/apiFetch';

type ConnectedApp = {
    id: string;
    name: string;
    scim_base_url: string;
    auth_header_name: string;
    auth_token?: string; // Optional in display, required for create/update if changing
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

// API Functions
const listConnectedApps = async (): Promise<ConnectedApp[]> => {
    return await apiFetch('/admin/scim-connections');
};

const createConnectedApp = async (data: Partial<ConnectedApp>) => {
    return await apiFetch('/admin/scim-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

const updateConnectedApp = async (id: string, data: Partial<ConnectedApp>) => {
    return await apiFetch(`/admin/scim-connections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

const deleteConnectedApp = async (id: string) => {
    return await apiFetch(`/admin/scim-connections/${id}`, { method: 'DELETE' });
};

const testConnection = async (data: Partial<ConnectedApp>) => {
    return await apiFetch('/admin/scim-connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

export default function ScimConnectionsPage() {
    const [apps, setApps] = useState<ConnectedApp[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<ConnectedApp>>({
        name: '',
        scim_base_url: '',
        auth_header_name: 'Authorization',
        auth_token: '',
        is_active: true,
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const refresh = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listConnectedApps();
            setApps(data);
        } catch (e: any) {
            setError(e.message || 'Failed to load SCIM connections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const openCreateModal = () => {
        setFormData({
            name: '',
            scim_base_url: '',
            auth_header_name: 'Authorization',
            auth_token: '',
            is_active: true,
        });
        setEditingId(null);
        setTestResult(null);
        setShowModal(true);
    };

    const openEditModal = (app: ConnectedApp) => {
        setFormData({
            name: app.name,
            scim_base_url: app.scim_base_url,
            auth_header_name: app.auth_header_name,
            auth_token: '', // Don't show existing token
            is_active: app.is_active,
        });
        setEditingId(app.id);
        setTestResult(null);
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalLoading(true);
        setTestResult(null);
        try {
            if (editingId) {
                // For update, only send token if it's not empty
                const updateData = { ...formData };
                if (!updateData.auth_token) {
                    delete updateData.auth_token;
                }
                await updateConnectedApp(editingId, updateData);
            } else {
                await createConnectedApp(formData);
            }
            setShowModal(false);
            refresh();
        } catch (e: any) {
            console.error('Save failed', e);
            setTestResult({ success: false, message: e.error || e.message || 'Failed to save' });
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this SCIM connection?')) return;
        try {
            await deleteConnectedApp(id);
            refresh();
        } catch (e: any) {
            alert('Failed to delete: ' + (e.error || e.message || 'Unknown error'));
        }
    };

    const handleTest = async () => {
        setModalLoading(true);
        setTestResult(null);
        try {
            const testData = { ...formData, id: editingId || undefined };
            const result = await testConnection(testData);
            if (result.success) {
                setTestResult({ success: true, message: 'Connection successful!' });
            } else {
                 setTestResult({ success: false, message: result.message || 'Connection failed' });
            }
        } catch (e: any) {
            setTestResult({ success: false, message: e.error || e.message || 'Connection test failed' });
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <HiCloud className="text-blue-600" />
                        SCIM Connections
                    </h1>
                    <p className="text-gray-500">Manage provisioning to external applications (Cloudflare, Salesforce, etc.)</p>
                </div>
                <Button onClick={openCreateModal} color="blue">
                    <HiPlus className="mr-2 h-5 w-5" />
                    Add Connection
                </Button>
            </div>

            {error && (
                <Alert color="failure" className="mb-4">
                    <span>{error}</span>
                </Alert>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHead>
                        <TableHeadCell>Name</TableHeadCell>
                        <TableHeadCell>SCIM URL</TableHeadCell>
                        <TableHeadCell>Status</TableHeadCell>
                        <TableHeadCell>Last Updated</TableHeadCell>
                        <TableHeadCell>Actions</TableHeadCell>
                    </TableHead>
                    <TableBody className="divide-y">
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                    <Spinner size="lg" />
                                </TableCell>
                            </TableRow>
                        ) : apps.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                    No SCIM connections found. Add one to start syncing users.
                                </TableCell>
                            </TableRow>
                        ) : (
                            apps.map((app) => (
                                <TableRow key={app.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                        {app.name}
                                    </TableCell>
                                    <TableCell className="truncate max-w-xs" title={app.scim_base_url}>
                                        {app.scim_base_url}
                                    </TableCell>
                                    <TableCell>
                                        {app.is_active ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Inactive
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(app.updated_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="xs" color="light" onClick={() => openEditModal(app)}>
                                                <HiPencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="xs" color="failure" onClick={() => handleDelete(app.id)}>
                                                <HiTrash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
                <ModalHeader>{editingId ? 'Edit Connection' : 'New SCIM Connection'}</ModalHeader>
                <ModalBody>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name" value="Connection Name" />
                            </div>
                            <TextInput
                                id="name"
                                placeholder="e.g. Cloudflare Access"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="url" value="SCIM Base URL" />
                            </div>
                            <TextInput
                                id="url"
                                placeholder="https://..."
                                value={formData.scim_base_url}
                                onChange={(e) => setFormData({ ...formData, scim_base_url: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">The base URL for the SCIM 2.0 API (e.g. https://api.cloudflare.com/.../scim/v2)</p>
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="header" value="Authorization Header Name" />
                            </div>
                            <TextInput
                                id="header"
                                placeholder="Authorization"
                                value={formData.auth_header_name}
                                onChange={(e) => setFormData({ ...formData, auth_header_name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="token" value={editingId ? "Auth Token (Leave blank to keep unchanged)" : "Auth Token"} />
                            </div>
                            <TextInput
                                id="token"
                                type="password"
                                placeholder="Secret Token"
                                value={formData.auth_token}
                                onChange={(e) => setFormData({ ...formData, auth_token: e.target.value })}
                                required={!editingId}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <ToggleSwitch
                                checked={formData.is_active || false}
                                label="Active (Sync Enabled)"
                                onChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                        </div>

                        {testResult && (
                            <Alert color={testResult.success ? 'success' : 'failure'} className="mt-4">
                                <span className="font-medium">{testResult.success ? 'Success!' : 'Error:'}</span> {testResult.message}
                            </Alert>
                        )}
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button color="blue" onClick={handleSave} isProcessing={modalLoading} disabled={modalLoading}>
                        {editingId ? 'Update' : 'Create'}
                    </Button>
                    <Button color="gray" onClick={handleTest} disabled={modalLoading || !formData.scim_base_url}>
                        Test Connection
                    </Button>
                    <Button color="light" onClick={() => setShowModal(false)} disabled={modalLoading}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
