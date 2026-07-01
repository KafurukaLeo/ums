import { Router } from 'express';
import { enrollmentsController } from './enrollments.controller';
import { authenticateJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateEnrollmentDto } from './dto/create.enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update.enrollment.dto';

const router = Router();

router.use(authenticateJwt);

router.get('/', requireRoles('admin', 'lecturer', 'student'), enrollmentsController.findAll);
router.get('/:id', requireRoles('admin', 'lecturer', 'student'), enrollmentsController.findOne);
router.post('/', requireRoles('admin', 'student'), validationMiddleware(CreateEnrollmentDto), enrollmentsController.create);
router.patch('/:id', requireRoles('admin'), validationMiddleware(UpdateEnrollmentDto), enrollmentsController.update);
router.delete('/:id', requireRoles('admin'), enrollmentsController.remove);

export default router;
