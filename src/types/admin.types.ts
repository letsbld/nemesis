export interface CreateUserData {
    first_name: string;
    middle_name?: string;
    last_name: string;
    display_name: string;
    company_email: string;
    alternate_email?: string;
    manager_id: string;
    username: string;
    password: string;
    description?: string;
    totp_enabled: boolean;
}

export interface UserData {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    display_name: string;
    company_email: string;
    alternate_email?: string;
    manager_id: string;
    username: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    totp_enabled: boolean;
    password: string;
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

export interface CreateDeviceData {
    device_id: string;
    device_name: string;
    os_version: string;
    hardware_model: string;
    serial_number: string;
    mac_address: string;
    agent_version: string;
}

export interface DeviceData {
    id: string;
    device_id: string;
    device_name: string;
    os_version: string;
    hardware_model: string;
    serial_number: string;
    mac_address: string;
    agent_version: string;
    status?: string;
    last_seen_at?: Date;
    created_at: Date;
    updated_at: Date;
    users?: any[]; // Array of user assignments to device
}

export interface CreateDeviceCommandData {
    device_id: string;
    command_type: string;
    command_payload: Record<string, any>;
}

export interface DeviceCommandData {
    id: string;
    device_id: string;
    command_type: string;
    command_payload: Record<string, any>;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    created_at: Date;
    updated_at: Date;
    executed_at?: Date;
    result?: string;
    error_message?: string;
}

export interface CommandGroupData {
    id: string;
    name: string;
    description?: string;
    commandIds: string[];
    created_at: Date;
    updated_at: Date;
}

export interface CreateCommandGroupData {
    name: string;
    description?: string;
    commandIds: string[];
}
