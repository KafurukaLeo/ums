import { Router } from 'express';
import { coursesController } from './courses.controller';
import { authenticateJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';

const router = Router();

router.use(authenticateJwt);

router.get('/', requireRoles('admin', 'lecturer', 'student'), coursesController.findAll);
router.get('/:id', requireRoles('admin', 'lecturer', 'student'), coursesController.findOne);
router.post('/', requireRoles('admin', 'lecturer'), validationMiddleware(CreateCourseDto), coursesController.create);
router.patch('/:id', requireRoles('admin', 'lecturer'), validationMiddleware(UpdateCourseDto), coursesController.update);
router.patch('/:id/allocate', requireRoles('admin'), coursesController.allocate);
router.delete('/:id', requireRoles('admin'), coursesController.remove);

export default router;
