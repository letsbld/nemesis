'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { apiFetch } from '@/lib/apiFetch';
import { Loader } from '@/components/ui/loader';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

interface GroupMember {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  company_email: string;
  manager_id?: string;
}

interface UserGroupMembersListProps {
  groupId: string;
  onMemberRemoved?: () => void;
}

export function UserGroupMembersList({ groupId, onMemberRemoved }: UserGroupMembersListProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchMembers();
    }
  }, [groupId]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/user-group/${groupId}`);
      setMembers(response || []);
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('Failed to load group members');
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddMember= async(userId: string) => {
    await apiFetch(`/user-group/${groupId}/members`, {
        method: 'POST',
      });
    // Implementation for adding a member to the group
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the group?')) return;

    setRemovingMemberId(userId);
    try {
      await apiFetch(`/user-group/${groupId}/members/${userId}`, {
        method: 'DELETE',
      });
      toast.success('User removed from group successfully!');
      fetchMembers();
      if (onMemberRemoved) {
        onMemberRemoved();
      }
    } catch (error) {
      console.error('Error removing user from group:', error);
      toast.error('Failed to remove user from group');
    } finally {
      setRemovingMemberId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No members in this group yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <TableHead>
          <TableRow>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Display Name</TableHeadCell>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>
              <span className="sr-only">Actions</span>
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          {members.map((member) => (
            <TableRow key={member.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {member.first_name} {member.last_name}
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">
                {member.display_name}
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">
                {member.company_email}
              </TableCell>
              <TableCell className="text-right">
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingMemberId === member.id}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                  title="Remove from group"
                >
                  {removingMemberId === member.id ? (
                    <Loader />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
