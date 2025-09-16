'use client';
import { registerPasskey } from '@/components/user/passkey';
import React from 'react';

const Page = () => {
    return (
        <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Register Passkey</h1>
            <button
                onClick={registerPasskey}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
            >
                Register
            </button>
        </div>
    );
};

export default Page;
