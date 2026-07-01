/**
 * Express Router defining API endpoints for the USERS module.
 * Binds controller actions, applies input validation schemas, and enforces role-based access control.
 */
import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticateJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';

const router = Router();

router.use(authenticateJwt);
router.use(requireRoles('admin')); // All routes in users are Admin-only

router.post('/', validationMiddleware(CreateUserDto), usersController.create);
router.get('/', usersController.findAll);
router.get('/:id', usersController.findOne);
router.patch('/:id', validationMiddleware(UpdateUserDto), usersController.update);
router.delete('/:id', usersController.remove);

export default router;
