import { NextRequest, NextResponse } from 'next/server';
import { UserGroupService } from '@/backend/domains/user-group/services/user-group.service';

// TODO: Add proper admin authentication middleware
export async function GET(request: NextRequest, context: { params: Promise<{ groupId: string }> }) {
    try {
        const { groupId } = await context.params;
        const userGroupService = new UserGroupService();
        const group = await userGroupService.getUserGroupById(groupId);

        if (!group) {
            return NextResponse.json({ error: 'User group not found' }, { status: 404 });
        }

        return NextResponse.json(group);
    } catch (error) {
        console.error('Error fetching user group:', error);
        return NextResponse.json({ error: 'Failed to fetch user group' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ groupId: string }> }) {
    try {
        const { groupId } = await context.params;
        const groupData = await request.json();

        const userGroupService = new UserGroupService();
        const updatedGroup = await userGroupService.updateUserGroup(groupId, groupData);

        if (!updatedGroup) {
            return NextResponse.json({ error: 'User group not found' }, { status: 404 });
        }

        return NextResponse.json(updatedGroup);
    } catch (error) {
        console.error('Error updating user group:', error);
        return NextResponse.json({ error: 'Failed to update user group' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ groupId: string }> }
) {
    try {
        const { groupId } = await context.params;
        const userGroupService = new UserGroupService();
        const success = await userGroupService.deleteUserGroup(groupId);

        if (!success) {
            return NextResponse.json({ error: 'User group not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User group deleted successfully' });
    } catch (error) {
        console.error('Error deleting user group:', error);
        return NextResponse.json({ error: 'Failed to delete user group' }, { status: 500 });
    }
}
