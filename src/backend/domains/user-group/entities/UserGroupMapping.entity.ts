import { Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/User.entity';
import { UserGroup } from './UserGroup.entity';

@Entity('user_group_mappings')
export class UserGroupMapping {
    @PrimaryColumn({ type: 'uuid' })
    user_id: string;

    @PrimaryColumn({ type: 'uuid' })
    user_group_id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => UserGroup, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_group_id' })
    userGroup: UserGroup;
}
