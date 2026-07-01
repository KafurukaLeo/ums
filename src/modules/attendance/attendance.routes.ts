import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { authenticateJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateAttendanceDto } from './dto/create.attendance.dto';
import { UpdateAttendanceDto } from './dto/update.attendance.dto';

const router = Router();

router.use(authenticateJwt);

router.get('/', requireRoles('admin', 'lecturer', 'student'), attendanceController.findAll);
router.get('/:id', requireRoles('admin', 'lecturer', 'student'), attendanceController.findOne);
router.post('/', requireRoles('admin', 'lecturer', 'student'), validationMiddleware(CreateAttendanceDto), attendanceController.create);
router.patch('/:id', requireRoles('admin', 'lecturer'), validationMiddleware(UpdateAttendanceDto), attendanceController.update);
router.delete('/:id', requireRoles('admin'), attendanceController.remove);

export default router;
