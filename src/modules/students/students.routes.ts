/**
 * Express Router defining API endpoints for the STUDENTS module.
 * Binds controller actions, applies input validation schemas, and enforces role-based access control.
 */
import { Router } from 'express';
import { studentsController } from './students.controller';
import { authenticateJwt, optionalJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateStudentDto } from './dto/create.student.dto';
import { UpdateStudentDto } from './dto/update.student.dto';
import { LoginDto } from '../auth/dto/login.dto';

const router = Router();

// Public login
router.post('/login', validationMiddleware(LoginDto), studentsController.login);

// Optional auth for create (allows both guest register and admin create)
router.post('/', optionalJwt, validationMiddleware(CreateStudentDto), studentsController.create);

// Standard auth required for the rest
router.use(authenticateJwt);

router.get('/', requireRoles('admin', 'lecturer'), studentsController.findAll);
router.get('/:id', requireRoles('admin', 'lecturer', 'student'), studentsController.findOne);
router.patch('/:id', requireRoles('admin', 'student'), validationMiddleware(UpdateStudentDto), studentsController.update);
router.delete('/:id', requireRoles('admin'), studentsController.remove);

// Student documents
router.get('/:id/exam-card', requireRoles('admin', 'student'), studentsController.getExamCard);
router.get('/:id/cat-card', requireRoles('admin', 'student'), studentsController.getCatCard);
router.get('/:id/transcript', requireRoles('admin', 'student'), studentsController.getTranscript);

export default router;
