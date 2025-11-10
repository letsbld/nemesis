'use client';

import { registerPasskey, getUserDevices, deletePasskey } from '@/components/user/passkey';
import React, { useEffect, useState } from 'react';
import { Commet } from 'react-loading-indicators';
import toast from "react-hot-toast";


const Page = () => {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch devices
    const fetchDevices = async () => {
        try {
            const passkeys = await getUserDevices();
            setDevices(passkeys);
        } catch (err) {
            console.error('Failed to fetch devices', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    // Handle new registration
    const handleRegister = async () => {
        await registerPasskey();
        await fetchDevices();
    };

    // Handle deletion
    const handleDelete = async (Id: string) => {
        if (!confirm('Are you sure you want to remove this passkey?')) return;

        try {
            const success = await deletePasskey(Id);
            if (success) {
                setDevices((prev) => prev.filter((d) => d.id !== Id));
                toast.success("Passkey removed successfully ✅");
            } else {
                toast.error("Failed to delete passkey ❌");
            }
        } catch (err) {
        toast.error("Something went wrong while deleting the passkey ❌");
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-16 p-8 bg-white dark:bg-[#1a2332] rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Passkeys</h1>
                <button
                    onClick={handleRegister}
                    className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
                >
                    Register Passkey
                </button>
                
            </div>

            {loading ? (
                <div className="flex justify-center py-6">
                    <Commet color="#318bcc" size="small" text="" textColor="" />
                </div>
            ) : devices.length === 0 ? (
                <p className="text-center text-gray-900 dark:text-gray-300">No passkeys registered yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-200">#</th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-200">Credential ID</th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-200">Device Type</th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-200">Registered At</th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-200">Last Used</th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-200">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map((d, index) => (
                                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-gray-900 dark:text-gray-300">
                                        {index + 1}
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-mono text-gray-900 dark:text-gray-300">
                                        {d.credential_id
                                            ? `${d.credential_id.slice(0, 6)}...${d.credential_id.slice(-6)}`
                                            : 'N/A'}
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-300">
                                        {d.transports || 'Unknown'}
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-300">
                                        {new Date(d.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-300">
                                        {new Date(d.updated_at).toLocaleDateString()}
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-gray-900 dark:text-gray-300">
                                        <button
                                            onClick={() => handleDelete(d.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Page;
