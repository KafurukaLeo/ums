import { Response } from 'express';
import { dashboardService } from './dashboard.service';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller to handle University Dashboard statistics and configuration requests.
 * Manages operations to register and update custom dashboard widget configurations.
 */
export class DashboardController {
  
  /**
   * Retrieve all dashboard configurations.
   */
  findAll = asyncHandler(async (req: any, res: Response) => {
    const result = await dashboardService.findAll();
    return result;
  });

  /**
   * Fetch a single dashboard config by ID.
   */
  findOne = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await dashboardService.findOne(id);
    return result;
  });

  /**
   * Create a new dashboard config.
   * Admin-only.
   */
  create = asyncHandler(async (req: any, res: Response) => {
    const result = await dashboardService.create(req.body);
    return result;
  });

  /**
   * Update an existing dashboard config.
   * Admin-only.
   */
  update = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await dashboardService.update(id, req.body);
    return result;
  });

  /**
   * Remove a dashboard config.
   * Admin-only.
   */
  remove = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await dashboardService.remove(id);
    return null;
  });
}

// Export singleton instance of DashboardController
export const dashboardController = new DashboardController();
