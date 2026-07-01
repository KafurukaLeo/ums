/**
 * Module components file: dashboard.service.ts.
 */
import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Dashboard } from './entities/dashboard.entity';
import { CreateDashboardDto } from './dto/create.dashboard.dto';
import { UpdateDashboardDto } from './dto/update.dashboard.dto';

/**
 * Dashboard Service.
 * Handles database operations for dashboard layout configurations and widgets.
 */
export class DashboardService {
  
  /**
   * Helper getter to resolve TypeORM repository for Dashboard Entity.
   */
  private get dashboardRepository() {
    return AppDataSource.getRepository(Dashboard);
  }

  /**
   * Fetch all dashboard configurations.
   */
  findAll(): Promise<Dashboard[]> {
    return this.dashboardRepository.find();
  }

  /**
   * Fetch a single dashboard config by ID.
   */
  async findOne(id: number): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.findOneBy({ id });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
    return dashboard;
  }

  /**
   * Create and save a new dashboard configuration.
   */
  create(data: CreateDashboardDto): Promise<Dashboard> {
    const dashboard = this.dashboardRepository.create(data);
    return this.dashboardRepository.save(dashboard);
  }

  /**
   * Update details of a dashboard configuration.
   */
  async update(id: number, data: UpdateDashboardDto): Promise<Dashboard> {
    await this.dashboardRepository.update(id, data);
    return this.findOne(id);
  }

  /**
   * Delete a dashboard configuration record by ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.dashboardRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
  }
}

// Export singleton instance of DashboardService
export const dashboardService = new DashboardService();
