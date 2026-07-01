/**
 * Module components file: admin.service.ts.
 */
import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create.admin.dto';
import { UpdateAdminDto } from './dto/update.admin.dto';
import { BcryptUtil } from '../../common/utils/bcrypt.util';

/**
 * Admin Service class.
 * Handles database operations for Administrator profiles, including password hashing.
 */
export class AdminService {
  
  /**
   * Helper getter to resolve TypeORM repository for Admin Entity.
   */
  private get adminRepository() {
    return AppDataSource.getRepository(Admin);
  }

  /**
   * Fetch all admin profiles.
   */
  findAll(): Promise<Admin[]> {
    return this.adminRepository.find();
  }

  /**
   * Fetch a single admin profile by ID.
   */
  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOneBy({ id });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return admin;
  }

  /**
   * Create and save a new admin profile, hashing the password with Bcrypt.
   */
  async create(data: CreateAdminDto): Promise<Admin> {
    const hashedPassword = await BcryptUtil.hash(data.password);
    const admin = this.adminRepository.create({
      ...data,
      password: hashedPassword,
    });
    return this.adminRepository.save(admin);
  }

  /**
   * Update details of an existing admin profile by ID.
   * Hashes the password if a new password is provided.
   */
  async update(id: number, data: UpdateAdminDto): Promise<Admin> {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await BcryptUtil.hash(data.password);
    }
    await this.adminRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Delete an admin profile by ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.adminRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
  }
}

// Export singleton instance of AdminService
export const adminService = new AdminService();
