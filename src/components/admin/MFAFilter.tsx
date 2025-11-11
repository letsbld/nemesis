'use client';

import React, { useState } from 'react';
import CustomButton from '@/components/ui/customButton';
import { CiCirclePlus, CiCircleRemove } from "react-icons/ci";

interface MFAFilterProps {
    mfaFilter: 'all' | 'yes' | 'no';
    onFilterChange: (filter: 'all' | 'yes' | 'no') => void;
}

export function MFAFilter({ mfaFilter, onFilterChange }: MFAFilterProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [tempFilter, setTempFilter] = useState<'all' | 'yes' | 'no'>(mfaFilter);

    const handleClick = () => {
        if (mfaFilter !== 'all') {
            // Clear filter if already applied
            onFilterChange('all');
            setTempFilter('all');
        } else {
            // Open dropdown if no filter applied
            setShowDropdown(!showDropdown);
            setTempFilter(mfaFilter);
        }
    };

    const handleApply = () => {
        if (tempFilter !== 'all') {
            onFilterChange(tempFilter);
            setShowDropdown(false);
        }
    };

    return (
        <div className="relative ml-3 mt-5">
            <CustomButton 
                startIcon={mfaFilter !== 'all' ? <CiCircleRemove className="w-4 h-4 text-red-600" /> : <CiCirclePlus className="w-4 h-4 text-green-700" />}
                name={mfaFilter === 'all' ? 'MFA' : (
                    <span>
                        {mfaFilter === 'yes' ? 'MFA: Yes' : 'MFA: No'}
                        <span className="text-white"> | is active</span>
                    </span>
                )}
                onClick={handleClick}
                btnType="button"
                style="border-dashed border-[#333e4f] text-[#99a1af] dark:text-gray-400 h-[28px]"
            />
            {showDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-white dark:bg-[#1a2332] border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 w-48 p-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            MFA Status
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                                <input
                                    type="radio"
                                    name="mfaFilter"
                                    checked={tempFilter === 'yes'}
                                    onChange={() => setTempFilter('yes')}
                                    className="mr-3 w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                            </label>
                            <label className="flex items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                                <input
                                    type="radio"
                                    name="mfaFilter"
                                    checked={tempFilter === 'no'}
                                    onChange={() => setTempFilter('no')}
                                    className="mr-3 w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                            </label>
                        </div>
                    </div>
                    <button
                        onClick={handleApply}
                        disabled={tempFilter === 'all'}
                        className="w-full px-3 py-2 text-sm text-white bg-[#1447E6] hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
}
