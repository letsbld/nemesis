'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import OverviewPage from './overview/page';
import ManagePasswordsPage from './manage/page';
import CreatePasswordPage from './create/page';
import { Home, List, PlusCircle } from 'lucide-react';

type Tab = 'overview' | 'manage' | 'create';

export default function PasswordManagerPage() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'manage', label: 'Manage', icon: List },
        { id: 'create', label: 'Create New', icon: PlusCircle },
    ];
    
    return (
        <div className="flex flex-col bg-gray-50">
            <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
                <nav className="flex -mb-px space-x-8 px-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="p-8"> 
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && <OverviewPage />}
                        {activeTab === 'manage' && <ManagePasswordsPage />}
                        {activeTab === 'create' && <CreatePasswordPage />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
