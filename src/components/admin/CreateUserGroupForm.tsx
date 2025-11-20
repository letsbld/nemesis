'use client';

import { useState, useEffect } from 'react';
import { CreateUserGroupData, UserGroupData } from '@/types/admin.types';
import { Modal, ModalBody, ModalHeader, Button } from "flowbite-react";
import { X } from 'lucide-react';

interface CreateUserGroupFormProps {
    onSubmit: (groupData: CreateUserGroupData) => void;
    onCancel: () => void;
    openModal: boolean;   // <-- added for Flowbite modal control
    setOpenModal: (value: boolean) => void; // <-- added
    isLoading?: boolean;
    initialData?: UserGroupData | null;
    mode?: 'create' | 'edit';
}

export function CreateUserGroupForm({
    onSubmit,
    onCancel,
    openModal,
    setOpenModal,
    isLoading = false,
    initialData = null,
    mode = 'create',
}: CreateUserGroupFormProps) {

    const [formData, setFormData] = useState({ name: '', description: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
    if (openModal) {
        if (mode === 'create') {
            // Reset form for create mode
            setFormData({
                name: '',
                description: '',
            });
            setErrors({});
        }

        if (mode === 'edit' && initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description || '',
            });
        }
    }
}, [openModal, mode, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Group name is required';
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

    const handleClose = () => {
        setOpenModal(false);
        onCancel();
    };

    return (
        <Modal show={openModal} size="md" onClose={handleClose} popup>
            <ModalHeader className="flex items-center justify-between px-6 py-4">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {mode === 'create' ? 'Add User Group' : 'Edit User Group'}
                </span>
            </ModalHeader>

            <ModalBody>
                <form onSubmit={handleSubmit} className="p-2 space-y-4">

                    {/* Group Name */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Group Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 ${
                                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter group name"
                            disabled={isLoading}
                            
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description <span className="text-gray-500">(optional)</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                            placeholder="Enter group description"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            color="gray"
                            onClick={handleClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? mode === 'create' ? 'Creating...' : 'Updating...'
                                : mode === 'create' ? 'Create Group' : 'Update Group'}
                        </Button>
                    </div>

                </form>
            </ModalBody>
        </Modal>
    );
}
