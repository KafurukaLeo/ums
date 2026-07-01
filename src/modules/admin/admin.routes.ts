/**
 * Express Router defining API endpoints for the ADMIN module.
 * Binds controller actions, applies input validation schemas, and enforces role-based access control.
 */
import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticateJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateAdminDto } from './dto/create.admin.dto';
import { UpdateAdminDto } from './dto/update.admin.dto';

const router = Router();

router.use(authenticateJwt);
router.use(requireRoles('admin')); // All admin routes are admin-only

router.get('/', adminController.findAll);
router.get('/:id', adminController.findOne);
router.post('/', validationMiddleware(CreateAdminDto), adminController.create);
router.patch('/:id', validationMiddleware(UpdateAdminDto), adminController.update);
router.delete('/:id', adminController.remove);

export default router;
