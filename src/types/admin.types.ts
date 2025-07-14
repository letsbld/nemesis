export interface CreateUserData {
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

export interface UserData {
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

export interface UserGroupData {
    id: string;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserGroupData {
    name: string;
    description?: string;
}

export interface GroupUserData {
    id: string;
    first_name: string;
    last_name: string;
    display_name: string;
    company_email: string;
    username: string;
}

export interface AddUsersToGroupData {
    userIds: string[];
}
