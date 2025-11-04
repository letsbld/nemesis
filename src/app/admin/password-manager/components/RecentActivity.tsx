'use client';
import React from 'react';
import { motion } from 'framer-motion';
// FIX: Imported FaTrash with correct capitalization (FaTrash, not Fatrash)
import { FaPlusCircle, FaTrash, FaShareAlt, FaArrowCircleRight, FaArrowCircleLeft } from 'react-icons/fa';
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
    deleted: FaTrash, // FIXED: Changed Fatrash to FaTrash
    sent: FaArrowCircleRight, // Changed to show direction
    received: FaArrowCircleLeft, // Added for clarity
};

const actionColors: { [key: string]: string } = {
    created: 'text-green-500',
    deleted: 'text-red-500',
    sent: 'text-blue-500',
    received: 'text-indigo-500', // Using a different color for receiving
};

interface Activity {
    id: string;
    action: 'created' | 'deleted' | 'sent' | 'received';
    credential_website: string;
    created_at: string;
    primary_user_name: string; // The user who performed the action (sender/creator/deleter/receiver)
    related_user_name: string | null; // The other user involved (receiver/sender)
}

export default function RecentActivity({ activities }: { activities: Activity[] }) {
    const renderActivityText = (activity: Activity) => {
        const { action, primary_user_name, related_user_name, credential_website } = activity;

        switch (action) {
            case 'created':
                return (
                    <>
                        <span className="font-bold">{primary_user_name}</span>
                        <span className="font-normal text-gray-500"> created a password for </span>
                        <span className="font-bold">{credential_website}</span>
                    </>
                );
            case 'deleted':
                return (
                    <>
                        <span className="font-bold">{primary_user_name}</span>
                        <span className="font-normal text-gray-500"> deleted a password for </span>
                        <span className="font-bold">{credential_website}</span>
                    </>
                );
            case 'sent':
                // primary_user_name is the sender, related_user_name is the receiver
                return (
                    <>
                        <span className="font-bold">{primary_user_name}</span>
                        <span className="font-normal text-gray-500"> shared a password for </span>
                        <span className="font-bold">{credential_website}</span>
                        <span className="font-normal text-gray-500"> with </span>
                        <span className="font-bold text-blue-700">{related_user_name || 'an unknown user'}</span>
                    </>
                );
            case 'received':
                // primary_user_name is the receiver, related_user_name is the sender
                return (
                    <>
                        <span className="font-bold">{primary_user_name}</span>
                        <span className="font-normal text-gray-500"> received a password for </span>
                        <span className="font-bold">{credential_website}</span>
                        <span className="font-normal text-gray-500"> from </span>
                        <span className="font-bold text-indigo-700">{related_user_name || 'an unknown user'}</span>
                    </>
                );
            default:
                return (
                    <>
                        <span className="font-bold">{primary_user_name}</span>
                        <span className="font-normal text-gray-500"> performed an action on </span>
                        <span className="font-bold">{credential_website}</span>
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
                        <div className={`mt-1 flex-shrink-0 ${actionColors[activity.action] || 'text-gray-500'}`}>
                            {React.createElement(actionIcons[activity.action] || FaPlusCircle, { size: 16 })}
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">
                                {renderActivityText(activity)}
                            </p>
                            <p className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}