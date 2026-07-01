/**
 * Module components file: users.service.ts.
 */
import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { BcryptUtil } from '../../common/utils/bcrypt.util';

/**
 * Users Service class.
 * Handles database operations for User accounts, including automatic password hashing.
 */
export class UsersService {
  
  /**
   * Helper getter to resolve TypeORM repository for User Entity.
   */
  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  /**
   * Look up a user profile by email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  /**
   * Fetch all registered user accounts.
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Fetch a single user profile by ID.
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Create and save a new user account.
   * Automatically hashes password using Bcrypt if not already hashed.
   */
  async create(dto: CreateUserDto): Promise<User> {
    const isHashed = dto.password && (dto.password.startsWith('$2b$') || dto.password.startsWith('$2a$'));
    const password = dto.password && !isHashed
      ? await BcryptUtil.hash(dto.password)
      : dto.password;

    const user = this.userRepository.create({
      ...dto,
      password,
    });
    return this.userRepository.save(user);
  }

  /**
   * Update details of an existing user account.
   * Re-hashes the password if a new unhashed password is provided in the update payload.
   */
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const updateData = { ...dto };
    if (updateData.password) {
      const isHashed = updateData.password.startsWith('$2b$') || updateData.password.startsWith('$2a$');
      if (!isHashed) {
        updateData.password = await BcryptUtil.hash(updateData.password);
      }
    }
    await this.userRepository.update(id, updateData as any);
    return this.findOne(id);
  }

  /**
   * Delete a user account by ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}

// Export singleton instance of UsersService
export const usersService = new UsersService();
