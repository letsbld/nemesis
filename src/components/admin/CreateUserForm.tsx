'use client';

import { useState, useEffect } from 'react';
import CustomButton from '@/components/ui/customButton';
import { CreateUserData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';

interface CreateUserFormProps {
    onSubmit: (userData: CreateUserData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

// Add prop for users list
interface UserOption {
    id: string;
    display_name: string;
}

export function CreateUserForm({ onSubmit, onCancel, isLoading = false }: CreateUserFormProps) {
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        display_name: '',
        company_email: '',
        alternate_email: '',
        username: '',
        password: '',
        description: '',
        manager_id: '', // new field
        totp_enabled: false, // TOTP is disabled by default for new users
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [users, setUsers] = useState<UserOption[]>([]);

    // Fetch all users for manager dropdown
    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await apiFetch('/user');
                setUsers(
                    data.map((u: any) => ({
                        id: u.id,
                        display_name: u.display_name,
                    }))
                );
            } catch {
                setUsers([]);
            }
        }
        fetchUsers();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Auto-generate display name
        if (name === 'first_name' || name === 'last_name') {
            const firstName = name === 'first_name' ? value : formData.first_name;
            const lastName = name === 'last_name' ? value : formData.last_name;
            if (firstName && lastName) {
                setFormData((prev) => ({
                    ...prev,
                    display_name: `${firstName} ${lastName}`,
                }));
            }
        }

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

        // Required fields
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.last_name) newErrors.last_name = 'Last name is required';
        if (!formData.display_name) newErrors.display_name = 'Display name is required';
        if (!formData.company_email) newErrors.company_email = 'Company email is required';
        if (!formData.manager_id) newErrors.manager_id = 'Manager is required';
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.password) newErrors.password = 'Password is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.company_email && !emailRegex.test(formData.company_email)) {
            newErrors.company_email = 'Invalid email format';
        }
        if (formData.alternate_email && !emailRegex.test(formData.alternate_email)) {
            newErrors.alternate_email = 'Invalid email format';
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{10,64}$/;
        if (formData.password) {
            if (!passwordRegex.test(formData.password)) {
                newErrors.password =
                    'Password must be 10-64 characters with at least one lowercase, uppercase, and special character';
            } else if (formData.password.toLowerCase().includes(formData.username.toLowerCase())) {
                newErrors.password = 'Password must not contain the username';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            // Remove manager_name, send manager_id
            const payload = { ...formData };
            // delete (payload as any).manager_name;
            onSubmit(payload);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">New User</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">First Name *</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${
                                errors.first_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.first_name && (
                            <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Middle Name</label>
                        <input
                            type="text"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Last Name *</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${
                                errors.last_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.last_name && (
                            <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                        )}
                    </div>
                </div>

                {/* Display Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">Display Name *</label>
                    <input
                        type="text"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md ${
                            errors.display_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                    />
                    {errors.display_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.display_name}</p>
                    )}
                </div>

                {/* Email Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Company Email *</label>
                        <input
                            type="email"
                            name="company_email"
                            value={formData.company_email}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${
                                errors.company_email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.company_email && (
                            <p className="text-red-500 text-xs mt-1">{errors.company_email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Alternate Email</label>
                        <input
                            type="email"
                            name="alternate_email"
                            value={formData.alternate_email}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${
                                errors.alternate_email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.alternate_email && (
                            <p className="text-red-500 text-xs mt-1">{errors.alternate_email}</p>
                        )}
                    </div>
                </div>

                {/* Manager Dropdown */}
                <div>
                    <label className="block text-sm font-medium mb-1">Manager *</label>
                    <select
                        name="manager_id"
                        value={formData.manager_id}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md ${
                            errors.manager_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                    >
                        <option value="">Select a manager</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.display_name}
                            </option>
                        ))}
                    </select>
                    {errors.manager_id && (
                        <p className="text-red-500 text-xs mt-1">{errors.manager_id}</p>
                    )}
                </div>

                {/* Username and Password */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${
                                errors.username ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${
                                errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            10-64 characters, must include lowercase, uppercase, and special
                            character
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={isLoading}
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                    <CustomButton
                        name={isLoading ? 'Creating...' : 'Create User'}
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
