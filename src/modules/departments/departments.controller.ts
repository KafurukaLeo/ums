/**
 * Module components file: departments.controller.ts.
 */
import { Response } from 'express';
import { departmentsService } from './departments.service';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller to handle all HTTP requests related to University Departments.
 * Manages operations to list, look up, register, edit, and delete department definitions.
 */
export class DepartmentsController {
  
  /**
   * Fetch all university departments.
   */
  findAll = asyncHandler(async (req: any, res: Response) => {
    const result = await departmentsService.findAll();
    return result;
  });

  /**
   * Fetch details of a single department by ID.
   */
  findOne = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await departmentsService.findOne(id);
    return result;
  });

  /**
   * Create/Register a new department.
   * Admin-only permission.
   */
  create = asyncHandler(async (req: any, res: Response) => {
    const result = await departmentsService.create(req.body);
    return result;
  });

  /**
   * Update department details by ID.
   * Admin-only permission.
   */
  update = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await departmentsService.update(id, req.body);
    return result;
  });

  /**
   * Delete a department by ID.
   * Admin-only permission.
   */
  remove = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await departmentsService.remove(id);
    return null;
  });
}

// Export singleton instance of DepartmentsController
export const departmentsController = new DepartmentsController();
