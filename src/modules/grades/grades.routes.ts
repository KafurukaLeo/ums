import { Router } from 'express';
import { gradesController } from './grades.controller';
import { authenticateJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateGradeDto } from './dto/create.grade.dto';
import { UpdateGradeDto } from './dto/update.grade.dto';

const router = Router();

router.use(authenticateJwt);

router.get('/', requireRoles('admin', 'lecturer', 'student'), gradesController.findAll);
router.get('/:id', requireRoles('admin', 'lecturer', 'student'), gradesController.findOne);
router.post('/', requireRoles('admin', 'lecturer'), validationMiddleware(CreateGradeDto), gradesController.create);
router.patch('/:id', requireRoles('admin', 'lecturer'), validationMiddleware(UpdateGradeDto), gradesController.update);
router.delete('/:id', requireRoles('admin'), gradesController.remove);

export default router;
