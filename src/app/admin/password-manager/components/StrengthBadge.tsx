import React from 'react';

export default function StrengthBadge({ strength }: { strength: string }) {
    const strengthColor = {
        'Weak': 'bg-red-100 text-red-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'Strong': 'bg-green-100 text-green-800',
    }[strength] || 'bg-gray-100 text-gray-800';

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${strengthColor}`}>
            {strength}
        </span>
    );
};