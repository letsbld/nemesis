'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch'; 
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import UsersTable from '../components/UsersTable';

interface UserData {
    id: string;
    display_name: string;
    company_email: string;
    password_count: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

export default function UsersPage() {
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const [displayedUsers, setDisplayedUsers] = useState<UserData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        apiFetch('/password-generator/admin/users') 
            .then((payload) => {
                if (Array.isArray(payload)) {
                    
                    const sortedUsers = [...payload].sort((a, b) =>
                        a.display_name.localeCompare(b.display_name)
                    );

                    setAllUsers(sortedUsers);
                    setDisplayedUsers(sortedUsers);
                } else {
                    throw new Error("Invalid user data format received.");
                }
            })
            .catch(() => setError('Could not load users.'))
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (!term.trim()) {
           
            setDisplayedUsers(allUsers);
        } else {
            const lower = term.toLowerCase();
            const filtered = allUsers.filter(user => 
                user.display_name.toLowerCase().includes(lower) ||
                user.company_email.toLowerCase().includes(lower)
            );
            setDisplayedUsers(filtered);
        }
    };

    if (loading) return <Spinner />;

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <p className="text-sm text-red-700 font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 -m-6 p-6 min-h-full flex flex-col">
            <motion.div
                className="space-y-6 flex-1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <h1 className="text-3xl font-bold text-gray-900">User Password Health</h1>

                <Card className="min-h-0">
                    <div className="relative mb-6">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <UsersTable
                        key={displayedUsers.length + searchTerm}
                        users={displayedUsers}
                    />

                    {displayedUsers.length === 0 && searchTerm && (
                        <div className="text-center py-10">
                            <p className="text-slate-500 text-lg">
                                No results found for "{searchTerm}".
                            </p>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}