'use client';

import { useState, useRef } from 'react';
import { UserData} from '@/types/admin.types';
import CustomButton from '@/components/ui/customButton';
import { ChevronsUpDown, CirclePlus, FileUp } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { PiDotsThreeBold } from "react-icons/pi";
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { Dropdown, DropdownItem } from "flowbite-react";


interface UserListProps {
  users: UserData[];
  onCreateUser: () => void;
  onDeleteUser: (userId: string, username: string) => Promise<void>;
  onResetPassword: (userId: string) => Promise<void>;
  onImportCSV: () => void;
  isLoading?: boolean;
  selectedUserIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCreationDateSort?: () => void;
  creationDateSortOrder?: 'latest' | 'oldest';
  onEditUser: (user: UserData) => void;
 }

export function UserList({
  users,
  onCreateUser,
  onDeleteUser,
  onCreationDateSort,
  creationDateSortOrder,
  onResetPassword,
  onImportCSV,
  isLoading = false,
  selectedUserIds,
  onSelectionChange,
  onEditUser,
}: UserListProps) {

 

  const handleCheckboxChange = (userId: string) => {
    const updated = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];

    onSelectionChange(updated);
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(users.map(u => u.id));
    }
  };

 

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="overflow-x-auto">
        <Table hoverable className="border border-gray-100 dark:border-gray-700 rounded-xl ">
          <TableHead >
            <TableRow>
              <TableHeadCell className="p-4">
                <Checkbox
                  checked={users.length > 0 && selectedUserIds.length === users.length}
                  onChange={() => handleSelectAll()}
                />
              </TableHeadCell>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Password</TableHeadCell>

              <TableHeadCell onClick={onCreationDateSort}>
                <span className="flex flex-row items-center gap-1 cursor-pointer">
                  Creation Date
                  <ChevronsUpDown
                    className={`w-4 h-4 ${
                      creationDateSortOrder === 'oldest' ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </TableHeadCell>

              <TableHeadCell>MFA</TableHeadCell>
              <TableHeadCell></TableHeadCell>
            </TableRow>
          </TableHead>

          <TableBody className="divide-y">

            {/* Empty State */}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <p>No users found</p>

                  <div className="flex justify-center gap-4 mt-4">
                    <CustomButton
                      startIcon={<FileUp className="w-4 h-4" />}
                      name="Import CSV"
                      onClick={onImportCSV}
                    />

                    <CustomButton
                      startIcon={<CirclePlus className="w-4 h-4" />}
                      name="New User"
                      onClick={onCreateUser}
                      style="bg-[#1447E6] hover:bg-blue-700 text-white"
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Users List */}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="p-4">
                  <Checkbox
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                </TableCell>

                <TableCell>{user.first_name} {user.middle_name} {user.last_name}</TableCell>
                <TableCell>{user.company_email}</TableCell>
                <TableCell>{user.password ? 'Set' : 'Not Set'}</TableCell>

                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </TableCell>

                <TableCell>
                  {user.totp_enabled ? (
                    <span className="p-1 bg-[#ECFDF5] rounded text-xs text-[#006045] border border-[#A4F4CF]">
                      Yes
                    </span>
                  ) : (
                    <span className="p-1 bg-[#FEF3F2] rounded text-xs text-[#991B1B] border border-[#FCA5A5]">
                      No
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <Dropdown label='' inline dismissOnClick={false} renderTrigger={() => <span>{<PiDotsThreeBold />}</span>}>
                    <DropdownItem onClick={() => onEditUser(user)}>Edit</DropdownItem>
                    <DropdownItem onClick={() => onResetPassword(user.id)}>Reset TOTP</DropdownItem>
                    <DropdownItem onClick={() => onDeleteUser(user.id,user.username)}>Delete</DropdownItem>
                    
                  </Dropdown>
                  
                </TableCell>
              </TableRow>
            ))}

          </TableBody>
        </Table>
      </div>
    </div>
  );
}
