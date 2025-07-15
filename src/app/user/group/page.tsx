'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const UserGroupPageRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the new admin user-groups page
        router.replace('/admin/user-groups');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-lg">Redirecting to admin panel...</div>
        </div>
    );
};

export default UserGroupPageRedirect;
