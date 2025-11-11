'use client';

import React, { useState } from 'react';
import CustomButton from '@/components/ui/customButton';
import { CiCirclePlus, CiCircleRemove } from "react-icons/ci";

interface CreationDateFilterProps {
    selectedDate: string | null;
    onDateChange: (date: string | null) => void;
}

export function CreationDateFilter({ selectedDate, onDateChange }: CreationDateFilterProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [tempDate, setTempDate] = useState<string>(selectedDate || '');

    const handleClick = () => {
        if (selectedDate) {
            // Clear filter if already applied
            onDateChange(null);
            setTempDate('');
        } else {
            // Open dropdown if no filter applied
            setShowDropdown(!showDropdown);
            setTempDate(selectedDate || '');
        }
    };

    const handleApply = () => {
        if (tempDate) {
            onDateChange(tempDate);
            setShowDropdown(false);
        }
    };

    return (
        <div className="relative ml-3 mt-5">
            <CustomButton 
                startIcon={selectedDate ? <CiCircleRemove className="w-4 h-4 text-red-600" /> : <CiCirclePlus className="w-4 h-4 text-green-700" />}
                name={selectedDate ? (
                    <span>
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })}
                        <span className="text-white"> | is active</span>
                    </span>
                ) : 'Creation date'}
                onClick={handleClick}
                btnType="button"
                style="border-dashed border-[#333e4f] text-[#99a1af] dark:text-gray-400 h-[28px]"
            />
            {showDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-white dark:bg-[#1a2332] border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 w-64 p-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Date
                        </label>
                        <input
                            type="date"
                            value={tempDate}
                            onChange={(e) => setTempDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#101828] text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <button
                        onClick={handleApply}
                        disabled={!tempDate}
                        className="w-full px-3 py-2 text-sm text-white bg-[#1447E6] hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
}
