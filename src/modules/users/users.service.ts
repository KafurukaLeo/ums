import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { BcryptUtil } from '../../common/utils/bcrypt.util';

export class UsersService {
  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

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

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}

export const usersService = new UsersService();
