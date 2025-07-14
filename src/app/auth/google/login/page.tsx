'use client';

import { signIn } from 'next-auth/react';

export default function GoogleLogin() {
    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
            <button
                onClick={() => signIn('google')}
                className="px-4 py-2 bg-black text-white rounded"
            >
                Sign in with Google
            </button>
        </div>
    );
}
