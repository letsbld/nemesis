import React from 'react';

export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string; }) {
    return (
        <div className={`bg-white dark:bg-[#1a2332] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
            {children}
        </div>
    );
}