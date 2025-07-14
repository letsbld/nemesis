import { NextRequest, NextResponse } from 'next/server';
import { UserGroupService } from '@/backend/domains/user-group';
import { AppDataSource } from '@/backend/lib/typeorm';

const userGroupService = new UserGroupService();

// GET /api/admin/user-groups - Get all user groups
export async function GET() {
    try {
        // TODO: Add proper admin authentication check

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const groups = await userGroupService.getAllUserGroups();
        return NextResponse.json(groups);
    } catch (error) {
        console.error('Error fetching user groups:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/admin/user-groups - Create a new user group
export async function POST(request: NextRequest) {
    try {
        // TODO: Add proper admin authentication check

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const body = await request.json();
        const { name, description } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                {
                    error: 'Group name is required',
                },
                { status: 400 }
            );
        }

        // Check if group name already exists
        const existingGroup = await userGroupService.getUserGroupByName(name);
        if (existingGroup) {
            return NextResponse.json(
                {
                    error: 'Group name already exists',
                },
                { status: 409 }
            );
        }

        // Create user group
        const newGroup = await userGroupService.createUserGroup({
            name,
            description,
        });

        return NextResponse.json(newGroup, { status: 201 });
    } catch (error) {
        console.error('Error creating user group:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
