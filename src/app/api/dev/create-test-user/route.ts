import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/backend/shared/database/typeorm';
import { User } from '@/backend/domains/user/entities/User.entity';
import { Admin } from '@/backend/domains/auth/entities/Admin.entity';
import bcrypt from 'bcrypt';

// This endpoint is for development purposes only
// In production, this should be removed or properly secured
export async function POST(request: NextRequest) {
    try {
        const { type, email, username, password, displayName } = await request.json();

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        if (type === 'user') {
            const userRepo = AppDataSource.getRepository(User);

            // Check if user already exists
            const existingUser = await userRepo.findOne({ where: { company_email: email } });
            if (existingUser) {
                return NextResponse.json({ error: 'User already exists' }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = userRepo.create({
                first_name: displayName.split(' ')[0] || 'Test',
                last_name: displayName.split(' ').slice(1).join(' ') || 'User',
                display_name: displayName,
                company_email: email,
                username: username,
                password: hashedPassword,
                manager_name: 'Test Manager',
            });

            await userRepo.save(user);
            return NextResponse.json({ success: true, message: 'Test user created successfully' });
        } else if (type === 'admin') {
            const adminRepo = AppDataSource.getRepository(Admin);

            // Check if admin already exists
            const existingAdmin = await adminRepo.findOne({ where: { email: email } });
            if (existingAdmin) {
                return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
            }

            const admin = adminRepo.create({
                google_id: `test_${email}`,
                email: email,
                display_name: displayName,
                avatar_url: '',
            });

            await adminRepo.save(admin);
            return NextResponse.json({ success: true, message: 'Test admin created successfully' });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        console.error('Error creating test user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
