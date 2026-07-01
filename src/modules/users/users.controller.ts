/**
 * Module components file: users.controller.ts.
 */
import { Response } from 'express';
import { usersService } from './users.service';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller class to handle all HTTP requests related to system Users.
 * Manages operations such as registration, listing users, viewing details, updates, and account removal.
 */
export class UsersController {
  
  /**
   * Create a new user account.
   * Admin-only or open registration permission.
   */
  create = asyncHandler(async (req: any, res: Response) => {
    const result = await usersService.create(req.body);
    return result;
  });

  /**
   * Fetch all user accounts in the database.
   * Admin-only permission.
   */
  findAll = asyncHandler(async (req: any, res: Response) => {
    const result = await usersService.findAll();
    return result;
  });

  /**
   * Fetch a single user account by ID.
   */
  findOne = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await usersService.findOne(id);
    return result;
  });

  /**
   * Update user details by ID.
   */
  update = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await usersService.update(id, req.body);
    return result;
  });

  /**
   * Delete a user account by ID.
   */
  remove = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await usersService.remove(id);
    return null;
  });
}

// Export singleton instance of UsersController
export const usersController = new UsersController();
