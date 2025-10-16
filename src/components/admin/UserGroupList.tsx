'use client';

import { UserGroupData } from '@/types/admin.types';
import CustomButton from '@/components/ui/customButton';
import { formatDate } from '@/lib/date-utils';
import { useRouter } from 'next/navigation';
import { Users, Plus, Pencil, Trash2, Settings } from 'lucide-react';

interface UserGroupListProps {
  groups: UserGroupData[];
  onCreateGroup: () => void;
  isLoading?: boolean;
}

export function UserGroupList({ groups, onCreateGroup, isLoading = false }: UserGroupListProps) {
  const router = useRouter();

  const handleManageMembers = (groupId: string) => {
    router.push(`/admin/user-groups/${groupId}/members`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Users className="text-blue-600 w-7 h-7" />
          <h1 className="text-3xl font-bold text-gray-900">User Group Management</h1>
        </div>
        <CustomButton
          name={
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Group
            </span>
          }
          onClick={onCreateGroup}
          btnType="button"
          style="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-sm"
          loading={isLoading}
        />
      </div>

      {/* Empty State */}
      {groups.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl shadow-inner">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg mb-6">No user groups found yet</p>
          <CustomButton
            name={
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create First Group
              </span>
            }
            onClick={onCreateGroup}
            btnType="button"
            style="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              {/* Group Header */}
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {group.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      className="p-1 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit Group"
                      onClick={() => {
                        /* TODO: Handle edit */
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Group"
                      onClick={() => {
                        /* TODO: Handle delete */
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {group.description ? (
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                    {group.description}
                  </p>
                ) : (
            ""
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Created: {formatDate(group.created_at)}</span>
                <CustomButton
                  children={
                    <span className="flex items-center gap-1">
                      <Settings className="w-3 h-3" />
                      Manage
                    </span>
                  }
                  onClick={() => handleManageMembers(group.id)}
                  btnType="button"
                  style="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 text-xs rounded-lg font-medium"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
