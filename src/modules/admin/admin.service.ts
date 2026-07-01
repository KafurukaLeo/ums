import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create.admin.dto';
import { UpdateAdminDto } from './dto/update.admin.dto';
import { BcryptUtil } from '../../common/utils/bcrypt.util';

export class AdminService {
  private get adminRepository() {
    return AppDataSource.getRepository(Admin);
  }

  findAll(): Promise<Admin[]> {
    return this.adminRepository.find();
  }

  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOneBy({ id });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return admin;
  }

  async create(data: CreateAdminDto): Promise<Admin> {
    const hashedPassword = await BcryptUtil.hash(data.password);
    const admin = this.adminRepository.create({
      ...data,
      password: hashedPassword,
    });
    return this.adminRepository.save(admin);
  }

  async update(id: number, data: UpdateAdminDto): Promise<Admin> {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await BcryptUtil.hash(data.password);
    }
    await this.adminRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.adminRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
  }
}

export const adminService = new AdminService();
