import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto';
import { User } from '../entities/User.entity';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUser(userData: CreateUserDto): Promise<UserResponseDto> {
        const user = await this.userRepository.create(userData);
        return this.mapToResponseDto(user);
    }

    async getUserById(id: string): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findById(id);
        return user ? this.mapToResponseDto(user) : null;
    }

    async getUserByUsername(username: string): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findByUsername(username);
        return user ? this.mapToResponseDto(user) : null;
    }

    async getUserByEmail(email: string): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findByEmail(email);
        return user ? this.mapToResponseDto(user) : null;
    }

    async getAllUsers(): Promise<UserResponseDto[]> {
        const users = await this.userRepository.findAll();
        return users.map((user) => this.mapToResponseDto(user));
    }

    async updateUser(id: string, userData: UpdateUserDto): Promise<UserResponseDto | null> {
        const user = await this.userRepository.update(id, userData);
        return user ? this.mapToResponseDto(user) : null;
    }

    async deleteUser(id: string): Promise<boolean> {
        return await this.userRepository.delete(id);
    }

    private mapToResponseDto(user: User): UserResponseDto {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
