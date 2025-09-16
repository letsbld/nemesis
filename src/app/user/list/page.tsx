'use client';
import { apiFetch } from '@/lib/apiFetch';
import React, { useEffect, useState } from 'react';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            setError('');
            try {
                const res = await apiFetch('/user', {
                    method: 'GET',
                });
                const data = res;
                const userList = Array.isArray(data) ? data : data.users || [];
                console.log('Fetched users:', userList);
                setUsers(userList);
            } catch (e: any) {
                setError(e.message || 'Error loading users');
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-6">All Users</h1>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : (
                <table className="min-w-full border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border-b">#</th>
                            <th className="py-2 px-4 border-b">Username</th>
                            <th className="py-2 px-4 border-b">Email</th>
                            <th className="py-2 px-4 border-b">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, i) => (
                            <tr key={u.id || i} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border-b">{i + 1}</td>
                                <td className="py-2 px-4 border-b">{u.username}</td>
                                <td className="py-2 px-4 border-b">{u.email}</td>
                                <td className="py-2 px-4 border-b">{u.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
