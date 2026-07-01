import { Response } from 'express';
import { adminService } from './admin.service';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller class to handle all HTTP requests related to Admin profiles.
 * Provides APIs to fetch, update, register, and delete administrative profiles.
 */
export class AdminController {
  
  /**
   * Fetch all admin profiles.
   * Admin-only permission.
   */
  findAll = asyncHandler(async (req: any, res: Response) => {
    const result = await adminService.findAll();
    return result;
  });

  /**
   * Fetch a single admin profile by ID.
   * Admin-only permission.
   */
  findOne = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await adminService.findOne(id);
    return result;
  });

  /**
   * Create/Register a new admin profile.
   * Admin-only permission.
   */
  create = asyncHandler(async (req: any, res: Response) => {
    const result = await adminService.create(req.body);
    return result;
  });

  /**
   * Update details of an existing admin profile by ID.
   * Admin-only permission.
   */
  update = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await adminService.update(id, req.body);
    return result;
  });

  /**
   * Delete an admin profile by ID.
   * Admin-only permission.
   */
  remove = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await adminService.remove(id);
    return null;
  });
}

// Export singleton instance of AdminController
export const adminController = new AdminController();
