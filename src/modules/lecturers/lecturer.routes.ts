/**
 * Express Router defining API endpoints for the LECTURER module.
 * Binds controller actions, applies input validation schemas, and enforces role-based access control.
 */
import { Router } from 'express';
import { lecturerController } from './lecturer.controller';
import { authenticateJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateLecturerDto } from './dto/create.lecturer.dto';
import { UpdateLecturerDto } from './dto/update.lecturer.dto';

const router = Router();

router.use(authenticateJwt);

router.get('/', requireRoles('admin', 'lecturer'), lecturerController.findAll);
router.get('/:id', requireRoles('admin', 'lecturer'), lecturerController.findOne);
router.post('/', requireRoles('admin'), validationMiddleware(CreateLecturerDto), lecturerController.create);
router.patch('/:id', requireRoles('admin', 'lecturer'), validationMiddleware(UpdateLecturerDto), lecturerController.update);
router.get('/:id/courses', requireRoles('admin', 'lecturer'), lecturerController.getAssignedCourses);
router.delete('/:id', requireRoles('admin'), lecturerController.remove);

export default router;
