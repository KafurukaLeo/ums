import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Dashboard } from './entities/dashboard.entity';
import { CreateDashboardDto } from './dto/create.dashboard.dto';
import { UpdateDashboardDto } from './dto/update.dashboard.dto';

export class DashboardService {
  private get dashboardRepository() {
    return AppDataSource.getRepository(Dashboard);
  }

  findAll(): Promise<Dashboard[]> {
    return this.dashboardRepository.find();
  }

  async findOne(id: number): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.findOneBy({ id });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
    return dashboard;
  }

  create(data: CreateDashboardDto): Promise<Dashboard> {
    const dashboard = this.dashboardRepository.create(data);
    return this.dashboardRepository.save(dashboard);
  }

  async update(id: number, data: UpdateDashboardDto): Promise<Dashboard> {
    await this.dashboardRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.dashboardRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
  }
}

export const dashboardService = new DashboardService();
