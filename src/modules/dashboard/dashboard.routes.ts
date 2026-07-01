/**
 * Express Router defining API endpoints for the DASHBOARD module.
 * Binds controller actions, applies input validation schemas, and enforces role-based access control.
 */
import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticateJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateDashboardDto } from './dto/create.dashboard.dto';
import { UpdateDashboardDto } from './dto/update.dashboard.dto';

const router = Router();

router.use(authenticateJwt);

router.get('/', requireRoles('admin', 'lecturer', 'student'), dashboardController.findAll);
router.get('/:id', requireRoles('admin', 'lecturer', 'student'), dashboardController.findOne);
router.post('/', requireRoles('admin'), validationMiddleware(CreateDashboardDto), dashboardController.create);
router.patch('/:id', requireRoles('admin'), validationMiddleware(UpdateDashboardDto), dashboardController.update);
router.delete('/:id', requireRoles('admin'), dashboardController.remove);

export default router;
