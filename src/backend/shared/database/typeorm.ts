import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../../domains/user/entities/User.entity';
import { UserGroup } from '../../domains/user-group/entities/UserGroup.entity';
import { UserGroupMapping } from '../../domains/user-group/entities/UserGroupMapping.entity';
import { Admin } from '../../domains/auth/entities/Admin.entity';
import { UserPasskey } from '../../domains/auth/entities/UserPasskey.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, UserGroup, UserGroupMapping, Admin, UserPasskey],
    synchronize: true, // Turn off in production
    logging: false,
});
