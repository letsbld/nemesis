import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/backend/domains/auth/services/auth.service';
import { AppDataSource } from '@/backend/lib/typeorm';
import { User } from '@/backend/domains/user/entities/User.entity';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: params.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Return user data without password
        const userResponse = {
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            company_email: user.company_email,
            alternate_email: user.alternate_email,
            manager_name: user.manager_name,
            email: user.company_email, // For backward compatibility
            created_at: user.created_at,
            updated_at: user.updated_at,
        };

        return NextResponse.json(userResponse);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const body = await request.json();
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({
            where: { id: params.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update user fields
        if (body.username) user.username = body.username;
        if (body.displayName) user.display_name = body.displayName;
        if (body.firstName) user.first_name = body.firstName;
        if (body.middleName !== undefined) user.middle_name = body.middleName;
        if (body.lastName) user.last_name = body.lastName;
        if (body.companyEmail) user.company_email = body.companyEmail;
        if (body.alternateEmail !== undefined) user.alternate_email = body.alternateEmail;
        if (body.managerName !== undefined) user.manager_name = body.managerName;

        await userRepository.save(user);

        // Return updated user data without password
        const userResponse = {
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            company_email: user.company_email,
            alternate_email: user.alternate_email,
            manager_name: user.manager_name,
            email: user.company_email,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };

        return NextResponse.json(userResponse);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: params.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await userRepository.remove(user);

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
