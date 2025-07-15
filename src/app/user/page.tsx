'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const UserPageRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the new admin users page
        router.replace('/admin/users');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-lg">Redirecting to admin panel...</div>
        </div>
    );
};

export default UserPageRedirect;
