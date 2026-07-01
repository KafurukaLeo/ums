/**
 * Express Router defining API endpoints for the DEPARTMENTS module.
 * Binds controller actions, applies input validation schemas, and enforces role-based access control.
 */
import { Router } from 'express';
import { departmentsController } from './departments.controller';
import { authenticateJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateDepartmentDto } from './dto/create.department.dto';
import { UpdateDepartmentDto } from './dto/update.department.dto';

const router = Router();

router.use(authenticateJwt);

router.get('/', requireRoles('admin', 'lecturer', 'student'), departmentsController.findAll);
router.get('/:id', requireRoles('admin', 'lecturer', 'student'), departmentsController.findOne);
router.post('/', requireRoles('admin'), validationMiddleware(CreateDepartmentDto), departmentsController.create);
router.patch('/:id', requireRoles('admin'), validationMiddleware(UpdateDepartmentDto), departmentsController.update);
router.delete('/:id', requireRoles('admin'), departmentsController.remove);

export default router;
