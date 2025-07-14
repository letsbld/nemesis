import { NextRequest, NextResponse } from 'next/server';
import { UserGroupService } from '@/backend/domains/user-group/services/user-group.service';

// TODO: Add proper admin authentication middleware
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ groupId: string }> }
) {
    try {
        const { groupId } = await context.params;
        const { userIds }: { userIds: string[] } = await request.json();

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: 'User IDs array is required' }, { status: 400 });
        }

        const userGroupService = new UserGroupService();
        await userGroupService.addUsersToGroup(groupId, userIds);

        return NextResponse.json({
            message: `${userIds.length} user(s) added to group successfully`,
        });
    } catch (error) {
        console.error('Error adding users to group:', error);
        return NextResponse.json({ error: 'Failed to add users to group' }, { status: 500 });
    }
}

export async function GET(request: NextRequest, context: { params: Promise<{ groupId: string }> }) {
    try {
        const { groupId } = await context.params;
        const userGroupService = new UserGroupService();
        const users = await userGroupService.getUsersByGroupId(groupId);

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching group users:', error);
        return NextResponse.json({ error: 'Failed to fetch group users' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ groupId: string }> }
) {
    try {
        const { groupId } = await context.params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const userGroupService = new UserGroupService();
        const success = await userGroupService.removeUserFromGroup(groupId, userId);

        if (!success) {
            return NextResponse.json({ error: 'User not found in group' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'User removed from group successfully',
        });
    } catch (error) {
        console.error('Error removing user from group:', error);
        return NextResponse.json({ error: 'Failed to remove user from group' }, { status: 500 });
    }
}
