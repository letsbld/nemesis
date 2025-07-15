'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const GroupMembersPageRedirect = () => {
    const router = useRouter();
    const params = useParams();
    const groupId = params.groupId as string;

    useEffect(() => {
        // Redirect to the new admin user-groups members page
        if (groupId) {
            router.replace(`/admin/user-groups/${groupId}/members`);
        } else {
            router.replace('/admin/user-groups');
        }
    }, [router, groupId]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-lg">Redirecting to admin panel...</div>
        </div>
    );
};

export default GroupMembersPageRedirect;
