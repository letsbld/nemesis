'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OIDCCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect back to test page with query parameters
        const urlParams = new URLSearchParams(window.location.search);
        router.push(`/test/oidc?${urlParams.toString()}`);
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Processing authorization response...</div>
        </div>
    );
}
