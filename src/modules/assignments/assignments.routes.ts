/**
 * Express Router defining API endpoints for the ASSIGNMENTS module.
 * Binds controller actions, applies input validation schemas, and enforces role-based access control.
 */
import { Router } from 'express';
import { assignmentsController } from './assignments.controller';
import { authenticateJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

const router = Router();

router.use(authenticateJwt);

router.get('/', requireRoles('admin', 'lecturer', 'student'), assignmentsController.findAll);
router.get('/course/:courseId', requireRoles('admin', 'lecturer', 'student'), assignmentsController.findByCourse);
router.get('/:id', requireRoles('admin', 'lecturer', 'student'), assignmentsController.findOne);
router.post('/', requireRoles('admin', 'lecturer'), validationMiddleware(CreateAssignmentDto), assignmentsController.create);
router.patch('/:id', requireRoles('admin', 'lecturer'), validationMiddleware(UpdateAssignmentDto), assignmentsController.update);
router.delete('/:id', requireRoles('admin'), assignmentsController.remove);

// Submissions
router.post('/:id/submit', requireRoles('admin', 'student'), validationMiddleware(SubmitAssignmentDto), assignmentsController.submit);
router.get('/:id/submissions', requireRoles('admin', 'lecturer'), assignmentsController.getSubmissions);
router.get('/submissions/student/:studentId', requireRoles('admin', 'lecturer', 'student'), assignmentsController.getStudentSubmissions);
router.patch('/submissions/:submissionId/grade', requireRoles('admin', 'lecturer'), validationMiddleware(GradeSubmissionDto), assignmentsController.gradeSubmission);

export default router;
