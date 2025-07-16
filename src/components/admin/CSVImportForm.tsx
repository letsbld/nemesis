'use client';

import React, { useState, useRef } from 'react';
import CustomButton from '@/components/ui/customButton';

interface ImportResult {
    success: number;
    failed: number;
    errors: { row: number; username?: string; email?: string; errors: string[] }[];
}

interface CSVImportProps {
    onImportComplete: () => void;
    onClose: () => void;
}

export function CSVImportForm({ onImportComplete, onClose }: CSVImportProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                setError('Please select a CSV file');
                return;
            }
            setFile(selectedFile);
            setError('');
            setImportResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/admin/users/import-csv', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setImportResult(data.result);
                if (data.result.success > 0) {
                    onImportComplete();
                }
            } else {
                setError(data.error || 'Upload failed');
                if (data.details) {
                    setError(`${data.error}: ${data.details.join(', ')}`);
                }
            }
        } catch (err) {
            setError('Failed to upload file');
            console.error('Upload error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = `first_name,middle_name,last_name,display_name,company_email,alternate_email,manager_name,username,password,description
John,M,Doe,John Doe,john.doe@company.com,john@personal.com,Jane Smith,johndoe,SecurePass123!,Sales representative
Jane,,Smith,Jane Smith,jane.smith@company.com,,John Doe,janesmith,StrongPwd456@,Marketing manager`;
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'users_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const resetForm = () => {
        setFile(null);
        setError('');
        setImportResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Users from CSV</h2>
                <p className="text-gray-600">
                    Upload a CSV file to import multiple users at once.
                </p>
            </div>

            {/* Template Download */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">CSV Template</h3>
                <p className="text-blue-700 mb-3">
                    Download the template file to see the required format and headers.
                </p>
                <CustomButton
                    name="Download Template"
                    onClick={downloadTemplate}
                    btnType="button"
                    style="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                />
            </div>

            {/* File Upload */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                </label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {file && (
                    <p className="mt-2 text-sm text-green-600">
                        Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </p>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Import Result */}
            {importResult && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Import Results</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-green-100 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                            <div className="text-sm text-green-700">Users Created</div>
                        </div>
                        <div className="text-center p-3 bg-red-100 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                            <div className="text-sm text-red-700">Failed</div>
                        </div>
                    </div>

                    {importResult.errors.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Errors:</h4>
                            <div className="max-h-64 overflow-y-auto">
                                {importResult.errors.map((error, index) => (
                                    <div key={index} className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                                        <div className="font-medium text-red-800">
                                            Row {error.row}
                                            {error.username && ` (${error.username})`}
                                            {error.email && ` - ${error.email}`}
                                        </div>
                                        <ul className="mt-1 text-red-700">
                                            {error.errors.map((err, errIndex) => (
                                                <li key={errIndex}>• {err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Required Fields Info */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Required CSV Headers</h3>
                <div className="text-yellow-700 text-sm">
                    <p className="mb-2">The CSV file must include these headers (in any order):</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>first_name</strong> - User&apos;s first name</li>
                        <li><strong>last_name</strong> - User&apos;s last name</li>
                        <li><strong>display_name</strong> - Display name for the user</li>
                        <li><strong>company_email</strong> - User&apos;s company email address</li>
                        <li><strong>username</strong> - Unique username for login</li>
                        <li><strong>password</strong> - Password (10-64 chars, mixed case, special char)</li>
                        <li><strong>manager_name</strong> - Name of the user&apos;s manager</li>
                    </ul>
                    <p className="mt-2">Optional headers: middle_name, alternate_email, description</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <CustomButton
                    name={isUploading ? 'Uploading...' : 'Import Users'}
                    onClick={handleUpload}
                    btnType="button"
                    style={`px-6 py-2 ${
                        file && !isUploading
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    loading={isUploading}
                />
                
                {importResult && (
                    <CustomButton
                        name="Import Another File"
                        onClick={resetForm}
                        btnType="button"
                        style="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                    />
                )}
                
                <CustomButton
                    name="Cancel"
                    onClick={onClose}
                    btnType="button"
                    style="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
                />
            </div>
        </div>
    );
}
