'use client';

import React, { useState } from 'react';

const DevicePage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="relative flex">
            <div className="flex-grow p-6">
                <h1 className="text-2xl font-bold mb-4">Device Page</h1>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={toggleSidebar}
                >
                    Add Device
                </button>
            </div>
            {isSidebarOpen && (
                <div className="fixed right-0 top-0 w-1/3 h-screen bg-gray-800 text-white p-4">
                    <h2 className="text-xl font-bold mb-4">Add Device</h2>
                    {/* Add your form or content here */}
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded"
                        onClick={toggleSidebar}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default DevicePage;
