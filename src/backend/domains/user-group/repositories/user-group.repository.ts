import { Repository } from 'typeorm';
import { UserGroup } from '../entities/UserGroup.entity';
import { UserGroupMapping } from '../entities/UserGroupMapping.entity';
import { AppDataSource } from '../../../shared/database/typeorm';
import { CreateUserGroupDto, UpdateUserGroupDto } from '../dto/user-group.dto';

export class UserGroupRepository {
    private userGroupRepository: Repository<UserGroup>;
    private userGroupMappingRepository: Repository<UserGroupMapping>;

    constructor() {
        this.userGroupRepository = AppDataSource.getRepository(UserGroup);
        this.userGroupMappingRepository = AppDataSource.getRepository(UserGroupMapping);
    }

    async create(groupData: CreateUserGroupDto): Promise<UserGroup> {
        const group = this.userGroupRepository.create(groupData);
        return await this.userGroupRepository.save(group);
    }

    async findById(id: string): Promise<UserGroup | null> {
        return await this.userGroupRepository.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<UserGroup | null> {
        return await this.userGroupRepository.findOne({ where: { name } });
    }

    async findAll(): Promise<UserGroup[]> {
        return await this.userGroupRepository.find();
    }

    async update(id: string, groupData: UpdateUserGroupDto): Promise<UserGroup | null> {
        await this.userGroupRepository.update(id, groupData);
        return await this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.userGroupRepository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async addUsersToGroup(groupId: string, userIds: string[]): Promise<void> {
        const mappings = userIds.map((userId) =>
            this.userGroupMappingRepository.create({
                user_id: userId,
                user_group_id: groupId,
            })
        );
        await this.userGroupMappingRepository.save(mappings);
    }

    async removeUserFromGroup(groupId: string, userId: string): Promise<boolean> {
        const result = await this.userGroupMappingRepository.delete({
            user_id: userId,
            user_group_id: groupId,
        });
        return result.affected ? result.affected > 0 : false;
    }

    async getUsersByGroupId(groupId: string): Promise<UserGroupMapping[]> {
        return await this.userGroupMappingRepository.find({
            where: { user_group_id: groupId },
            relations: ['user'],
        });
    }
}
