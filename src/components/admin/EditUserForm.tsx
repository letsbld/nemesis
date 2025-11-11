'use client';

import { useState, useEffect } from 'react';
import CustomButton from '@/components/ui/customButton';
import { UserData, CreateUserData } from '@/types/admin.types';
import { apiFetch } from '@/lib/apiFetch';
import { Input } from '@/components/ui/input';

interface EditUserFormProps {
    user: UserData;
    onSubmit: (userData: Partial<CreateUserData>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

interface UserOption {
    id: string;
    display_name: string;
}

export function EditUserForm({ user, onSubmit, onCancel, isLoading = false }: EditUserFormProps) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        display_name: '',
        company_email: '',
        alternate_email: '',
        username: '',
        description: '',
        manager_id: '',
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

    useEffect(() => {
        // Initialize form with user data
        setFormData({
            username: user.username || '',
            display_name: user.display_name || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            manager_id: user.manager_id || '',
            company_email: user.company_email || '',
            alternate_email: user.alternate_email || '',
            description: user.description || '',
        });
    }, [user]);

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
        if (!formData.username) newErrors.username = 'Username is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.company_email && !emailRegex.test(formData.company_email)) {
            newErrors.company_email = 'Invalid email format';
        }
        if (formData.alternate_email && !emailRegex.test(formData.alternate_email)) {
            newErrors.alternate_email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1a2332] p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Edit User</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">First Name</label>
                        <Input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md dark:bg-[#101828] dark:text-gray-100 ${
                                errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            disabled={isLoading}
                            placeholder="Enter first name"
                        />
                        {errors.first_name && (
                            <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Last Name</label>
                        <Input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md dark:bg-[#101828] dark:text-gray-100 ${
                                errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            disabled={isLoading}
                            placeholder="Enter last name"
                        />
                        {errors.last_name && (
                            <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                        )}
                    </div>
                
                {/* Display Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Display Name </label>
                        <Input
                            type="text"
                            name="display_name"
                            value={formData.display_name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md dark:bg-[#101828] dark:text-gray-100 ${
                                errors.display_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            disabled={isLoading}
                            placeholder="Enter display name"
                        />
                        {errors.display_name && (
                            <p className="text-red-500 text-xs mt-1">{errors.display_name}</p>
                        )}
                    </div>
                    {/* Manager Dropdown */}                
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Manager name <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(optional)</span></label>
                        <select
                            name="manager_id"
                            value={formData.manager_id}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md dark:bg-[#101828] dark:text-gray-100 ${
                                errors.manager_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            disabled={isLoading}
                        >
                            <option value="" className="text-gray-400 dark:text-gray-500">Select a manager</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id} className="text-gray-900 dark:text-gray-100">
                                    {u.display_name}
                                </option>
                            ))}
                        </select>
                        {errors.manager_id && (
                            <p className="text-red-500 text-xs mt-1">{errors.manager_id}</p>
                        )}
                    </div>

                {/* Email Fields */}
                
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Company Email</label>
                        <Input
                            type="email"
                            name="company_email"
                            value={formData.company_email}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md dark:bg-[#101828] dark:text-gray-100 ${
                                errors.company_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            disabled={isLoading}
                            placeholder="Enter company email"
                        />
                        {errors.company_email && (
                            <p className="text-red-500 text-xs mt-1">{errors.company_email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Alternate email<span className="text-sm font-normal text-gray-500 dark:text-gray-400">(optional)</span></label>
                        <Input
                            type="email"
                            name="alternate_email"
                            value={formData.alternate_email}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md dark:bg-[#101828] dark:text-gray-100 ${
                                errors.alternate_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            disabled={isLoading}
                            placeholder="Enter alternate email"
                        />
                        {errors.alternate_email && (
                            <p className="text-red-500 text-xs mt-1">{errors.alternate_email}</p>
                        )}
                    </div>

                {/* Username */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Username *</label>
                        <Input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md dark:bg-[#101828] dark:text-gray-100 ${
                                errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            disabled={isLoading}
                            placeholder="Enter username"
                        />
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#101828] dark:text-gray-100"
                        disabled={isLoading}
                        placeholder="Enter text here...."
                    />
                </div>

                {/* Buttons */} 
                <div className="flex justify-end">
                <div className="flex gap-4 pt-4 ">
                    <CustomButton
                        name="Cancel"
                        btnType="button"
                        onClick={onCancel}
                        style="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-2"
                    />
                    <CustomButton
                        name={isLoading ? 'Updating...' : 'Update User'}
                        btnType="submit"
                        style="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                        loading={isLoading}
                    />
                </div>
                </div>
            </form>
        </div>
    );
}
