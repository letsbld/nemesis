import React from 'react';

export default function MetricCard({ title, value, Icon }: { title: string; value: any; Icon: React.ElementType; }) {
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 transition-all hover:shadow-md hover:border-indigo-200">
            <div className="bg-indigo-50 text-indigo-500 rounded-full p-3">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-semibold text-gray-800">{value}</p>
            </div>
        </div>
    );
}