import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string; }) {
    return (
        <div className={`bg-white dark:bg-[#1a2332] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
            {children}
        </div>
    );
}

export function Spinner() {
    return (
        <div className="flex justify-center items-center p-8">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

export function MetricCard({ title, value, Icon }: { title: string; value: any; Icon: React.ElementType; }) {
    return (
        <div className="bg-white dark:bg-[#1a2332] p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-600">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 rounded-full p-3">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{value}</p>
            </div>
        </div>
    );
}