'use client';

import { useState } from 'react';
import CustomButton from '@/components/ui/customButton';
import { CreateUserGroupData } from '@/types/admin.types';

interface CreateUserGroupFormProps {
    onSubmit: (groupData: CreateUserGroupData) => void;
    onCancel: () => void;
    isLoading?: boolean;
} 

export function CreateUserGroupForm({
    onSubmit,
    onCancel,
    isLoading = false,
}: CreateUserGroupFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Group name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
            });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">Create New User Group</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Group Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Engineering, Marketing, HR"
                        disabled={isLoading}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Brief description of the group"
                        disabled={isLoading}
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <CustomButton
                        name={isLoading ? 'Creating...' : 'Create Group'}
                        btnType="submit"
                        style="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                        loading={isLoading}
                    />
                    <CustomButton
                        name="Cancel"
                        btnType="button"
                        onClick={onCancel}
                        style="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
                    />
                </div>
            </form>
        </div>
    );
}
