import { UserGroupRepository } from '../repositories/user-group.repository';
import {
    CreateUserGroupDto,
    UpdateUserGroupDto,
    UserGroupResponseDto,
    GroupUserDto,
} from '../dto/user-group.dto';
import { UserGroup } from '../entities/UserGroup.entity';

export class UserGroupService {
    private userGroupRepository: UserGroupRepository;

    constructor() {
        this.userGroupRepository = new UserGroupRepository();
    }

    async createUserGroup(groupData: CreateUserGroupDto): Promise<UserGroupResponseDto> {
        const group = await this.userGroupRepository.create(groupData);
        return this.mapToResponseDto(group);
    }

    async getUserGroupById(id: string): Promise<UserGroupResponseDto | null> {
        const group = await this.userGroupRepository.findById(id);
        return group ? this.mapToResponseDto(group) : null;
    }

    async getUserGroupByName(name: string): Promise<UserGroupResponseDto | null> {
        const group = await this.userGroupRepository.findByName(name);
        return group ? this.mapToResponseDto(group) : null;
    }

    async getAllUserGroups(): Promise<UserGroupResponseDto[]> {
        const groups = await this.userGroupRepository.findAll();
        return groups.map((group) => this.mapToResponseDto(group));
    }

    async updateUserGroup(
        id: string,
        groupData: UpdateUserGroupDto
    ): Promise<UserGroupResponseDto | null> {
        const group = await this.userGroupRepository.update(id, groupData);
        return group ? this.mapToResponseDto(group) : null;
    }

    async deleteUserGroup(id: string): Promise<boolean> {
        return await this.userGroupRepository.delete(id);
    }

    async addUsersToGroup(groupId: string, userIds: string[]): Promise<void> {
        return await this.userGroupRepository.addUsersToGroup(groupId, userIds);
    }

    async removeUserFromGroup(groupId: string, userId: string): Promise<boolean> {
        return await this.userGroupRepository.removeUserFromGroup(groupId, userId);
    }

    async getUsersByGroupId(groupId: string): Promise<GroupUserDto[]> {
        const mappings = await this.userGroupRepository.getUsersByGroupId(groupId);
        return mappings.map((mapping) => ({
            id: mapping.user.id,
            first_name: mapping.user.first_name,
            last_name: mapping.user.last_name,
            display_name: mapping.user.display_name,
            company_email: mapping.user.company_email,
            username: mapping.user.username,
        }));
    }

    private mapToResponseDto(group: UserGroup): UserGroupResponseDto {
        return {
            id: group.id,
            name: group.name,
            description: group.description,
            created_at: group.created_at,
            updated_at: group.updated_at,
        };
    }
}
