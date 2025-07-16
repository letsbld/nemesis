import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/backend/domains/user';
import { AppDataSource } from '@/backend/lib/typeorm';
import { verifyAdminAuth } from '@/backend/lib/auth-helpers';

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

interface CSVUserData {
    first_name: string;
    middle_name?: string;
    last_name: string;
    display_name: string;
    company_email: string;
    alternate_email?: string;
    manager_name: string;
    username: string;
    password: string;
    description?: string;
}

interface ImportResult {
    success: number;
    failed: number;
    errors: { row: number; username?: string; email?: string; errors: string[] }[];
}

function parseCSV(csvContent: string): { data: CSVUserData[]; errors: string[] } {
    const lines = csvContent.trim().split('\n');
    const errors: string[] = [];
    
    if (lines.length < 2) {
        errors.push('CSV file must contain at least a header row and one data row');
        return { data: [], errors };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const expectedHeaders = [
        'first_name', 'last_name', 'display_name', 'company_email', 
        'username', 'password', 'manager_name'
    ];

    // Check for required headers
    for (const header of expectedHeaders) {
        if (!headers.includes(header)) {
            errors.push(`Missing required header: ${header}`);
        }
    }

    if (errors.length > 0) {
        return { data: [], errors };
    }

    const data: CSVUserData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Column count mismatch`);
            continue;
        }

        const userData: any = {};
        headers.forEach((header, index) => {
            userData[header] = values[index] || undefined;
        });

        // Validate required fields
        const missingFields = expectedHeaders.filter(field => !userData[field]);
        if (missingFields.length > 0) {
            errors.push(`Row ${i + 1}: Missing required fields: ${missingFields.join(', ')}`);
            continue;
        }

        data.push(userData as CSVUserData);
    }

    return { data, errors };
}

// POST /api/admin/users/import-csv - Import users from CSV
export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth();
        if (!authResult.isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!file.name.endsWith('.csv')) {
            return NextResponse.json(
                { error: 'File must be a CSV file' },
                { status: 400 }
            );
        }

        const csvContent = await file.text();
        const { data: users, errors: parseErrors } = parseCSV(csvContent);

        if (parseErrors.length > 0) {
            return NextResponse.json(
                { error: 'CSV parsing errors', details: parseErrors },
                { status: 400 }
            );
        }

        const result: ImportResult = {
            success: 0,
            failed: 0,
            errors: []
        };

        // Process each user
        for (let i = 0; i < users.length; i++) {
            const userData = users[i];
            const rowNumber = i + 2; // +2 because of header row and 0-based index
            const rowErrors: string[] = [];

            try {
                // Validate password
                const passwordValidation = validatePassword(userData.password, userData.username);
                if (!passwordValidation.valid) {
                    rowErrors.push(passwordValidation.error!);
                }

                // Check if username already exists
                const existingUserByUsername = await userService.getUserByUsername(userData.username);
                if (existingUserByUsername) {
                    rowErrors.push('Username already exists');
                }

                // Check if email already exists
                const existingUserByEmail = await userService.getUserByEmail(userData.company_email);
                if (existingUserByEmail) {
                    rowErrors.push('Email already exists');
                }

                // If there are validation errors, record them and continue
                if (rowErrors.length > 0) {
                    result.failed++;
                    result.errors.push({
                        row: rowNumber,
                        username: userData.username,
                        email: userData.company_email,
                        errors: rowErrors
                    });
                    continue;
                }

                // Create user
                await userService.createUser({
                    first_name: userData.first_name,
                    middle_name: userData.middle_name,
                    last_name: userData.last_name,
                    display_name: userData.display_name,
                    company_email: userData.company_email,
                    alternate_email: userData.alternate_email,
                    manager_name: userData.manager_name,
                    username: userData.username,
                    password: userData.password,
                    description: userData.description,
                });

                result.success++;
            } catch (error) {
                console.error(`Error creating user at row ${rowNumber}:`, error);
                result.failed++;
                result.errors.push({
                    row: rowNumber,
                    username: userData.username,
                    email: userData.company_email,
                    errors: ['Failed to create user: Internal server error']
                });
            }
        }

        return NextResponse.json({
            message: `Import completed. ${result.success} users created successfully, ${result.failed} failed.`,
            result
        }, { status: 200 });

    } catch (error) {
        console.error('Error importing CSV:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
