import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/backend/domains/user';
import { AppDataSource } from '@/backend/lib/typeorm';

const userService = new UserService();

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{10,64}$/;

function validatePassword(password: string, username: string): { valid: boolean; error?: string } {
    if (!PASSWORD_REGEX.test(password)) {
        return {
            valid: false,
            error: 'Password must be 10-64 characters with at least one lowercase, uppercase, and special character',
        };
    }

    if (password.toLowerCase().includes(username.toLowerCase())) {
        return {
            valid: false,
            error: 'Password must not contain the username',
        };
    }

    return { valid: true };
}

// GET /api/admin/users - Get all users
export async function GET() {
    try {
        // TODO: Add proper admin authentication check

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const users = await userService.getAllUsers();
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
    try {
        // TODO: Add proper admin authentication check

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const body = await request.json();
        const {
            first_name,
            middle_name,
            last_name,
            display_name,
            company_email,
            alternate_email,
            manager_name,
            username,
            password,
            description,
        } = body;

        // Validate required fields
        if (
            !first_name ||
            !last_name ||
            !display_name ||
            !company_email ||
            !username ||
            !password ||
            !manager_name
        ) {
            return NextResponse.json(
                {
                    error: 'Missing required fields',
                },
                { status: 400 }
            );
        }

        // Validate password
        const passwordValidation = validatePassword(password, username);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                {
                    error: passwordValidation.error,
                },
                { status: 400 }
            );
        }

        // Check if username or email already exists
        const existingUserByUsername = await userService.getUserByUsername(username);
        if (existingUserByUsername) {
            return NextResponse.json(
                {
                    error: 'Username already exists',
                },
                { status: 409 }
            );
        }

        const existingUserByEmail = await userService.getUserByEmail(company_email);
        if (existingUserByEmail) {
            return NextResponse.json(
                {
                    error: 'Email already exists',
                },
                { status: 409 }
            );
        }

        // Create user
        const newUser = await userService.createUser({
            first_name,
            middle_name,
            last_name,
            display_name,
            company_email,
            alternate_email,
            manager_name,
            username,
            password, // Note: In production, hash this password
            description,
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
