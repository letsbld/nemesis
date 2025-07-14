export interface CreateUserDto {
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

export interface UpdateUserDto {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    display_name?: string;
    company_email?: string;
    alternate_email?: string;
    manager_name?: string;
    username?: string;
    password?: string;
    description?: string;
}

export interface UserResponseDto {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    display_name: string;
    company_email: string;
    alternate_email?: string;
    manager_name: string;
    username: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}
