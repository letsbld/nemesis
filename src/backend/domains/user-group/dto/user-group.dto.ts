export interface CreateUserGroupDto {
    name: string;
    description?: string;
}

export interface UpdateUserGroupDto {
    name?: string;
    description?: string;
}

export interface UserGroupResponseDto {
    id: string;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

export interface GroupUserDto {
    id: string;
    first_name: string;
    last_name: string;
    display_name: string;
    company_email: string;
    username: string;
}
