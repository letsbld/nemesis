import { Repository } from 'typeorm';
import { User } from '../entities/User.entity';
import { AppDataSource } from '../../../shared/database/typeorm';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

export class UserRepository {
    private repository: Repository<User>;

    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }

    async create(userData: CreateUserDto): Promise<User> {
        const user = this.repository.create(userData);
        return await this.repository.save(user);
    }

    async findById(id: string): Promise<User | null> {
        return await this.repository.findOne({ where: { id } });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.repository.findOne({ where: { username } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.repository.findOne({ where: { company_email: email } });
    }

    async findAll(): Promise<User[]> {
        return await this.repository.find();
    }

    async update(id: string, userData: UpdateUserDto): Promise<User | null> {
        await this.repository.update(id, userData);
        return await this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
}
