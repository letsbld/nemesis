'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { 
    FaPlusCircle, 
    FaTrash, 
    FaArrowCircleRight, 
    FaArrowCircleLeft, 
    FaExclamationTriangle 
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.4
        }
    }
};

const actionIcons: { [key: string]: React.ElementType } = {
    created: FaPlusCircle,
    deleted: FaTrash,
    sent: FaArrowCircleRight,
    received: FaArrowCircleLeft,
    expired: FaExclamationTriangle,
};

const actionColors: { [key: string]: string } = {
    created: 'text-green-500',
    deleted: 'text-red-500',
    sent: 'text-blue-500',
    received: 'text-indigo-500',
    expired: 'text-yellow-600',
};

interface Activity {
    id: string;
    action: 'created' | 'deleted' | 'sent' | 'received' | 'expired';
    credential_website: string;
    created_at: string;
    primary_user_name: string;
    related_user_name: string | null;
}

export default function RecentActivity({ activities }: { activities: Activity[] }) {
    const renderActivityText = (activity: Activity) => {
        const { action, primary_user_name, related_user_name, credential_website } = activity;

        switch (action) {
            case 'created':
                return (
                    <>
                        <span className="font-bold dark:text-gray-200">{primary_user_name}</span>
                        <span className="font-normal text-gray-500 dark:text-gray-400"> created a password for </span>
                        <span className="font-bold dark:text-gray-200">{credential_website}</span>
                    </>
                );
            case 'deleted':
                return (
                    <>
                        <span className="font-bold dark:text-gray-200">{primary_user_name}</span>
                        <span className="font-normal text-gray-500 dark:text-gray-400"> deleted a password for </span>
                        <span className="font-bold dark:text-gray-200">{credential_website}</span>
                    </>
                );
            case 'sent':
                return (
                    <>
                        <span className="font-bold dark:text-gray-200">{primary_user_name}</span>
                        <span className="font-normal text-gray-500 dark:text-gray-400"> shared a password for </span>
                        <span className="font-bold dark:text-gray-200">{credential_website}</span>
                        <span className="font-normal text-gray-500 dark:text-gray-400"> with </span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">{related_user_name || 'an unknown user'}</span>
                    </>
                );
            case 'received':
                return (
                    <>
                        <span className="font-bold dark:text-gray-200">{primary_user_name}</span>
                        <span className="font-normal text-gray-500 dark:text-gray-400"> received a password for </span>
                        <span className="font-bold dark:text-gray-200">{credential_website}</span>
                        <span className="font-normal text-gray-500 dark:text-gray-400"> from </span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-400">{related_user_name || 'an unknown user'}</span>
                    </>
                );
            case 'expired':
                return (
                    <>
                        <span className="font-normal text-gray-500 dark:text-gray-400">A shared password for </span>
                        <span className="font-bold dark:text-gray-200">{credential_website}</span>
                        <span className="font-normal text-gray-500 dark:text-gray-400"> from </span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-400">{related_user_name || 'an unknown user'}</span>
                        <span className="font-normal text-gray-500 dark:text-gray-400"> expired.</span>
                    </>
                );
            default:
                return (
                    <>
                        <span className="font-bold dark:text-gray-200">{primary_user_name}</span>
                        <span className="font-normal text-gray-500 dark:text-gray-400"> performed an action on </span>
                        <span className="font-bold dark:text-gray-200">{credential_website}</span>
                    </>
                );
        }
    };

    return (
        <motion.div
            className="flex flex-col h-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="space-y-4">
                {activities.map((activity) => (
                    <motion.div key={activity.id} variants={itemVariants} className="flex items-start gap-3">
                        <div className={`mt-1 flex-shrink-0 ${actionColors[activity.action] || 'text-gray-500 dark:text-gray-400'}`}>
                            {React.createElement(actionIcons[activity.action] || FaPlusCircle, { size: 16 })}
                        </div>
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {renderActivityText(activity)}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}