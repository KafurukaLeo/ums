import { Router } from 'express';
import { financeController } from './finance.controller';
import { authenticateJwt, requireRoles } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

const router = Router();

router.use(authenticateJwt);

// Fee structures
router.post('/fee-structures', requireRoles('admin'), validationMiddleware(CreateFeeStructureDto), financeController.createFeeStructure);
router.get('/fee-structures', requireRoles('admin', 'lecturer', 'student'), financeController.findAllFeeStructures);
router.get('/fee-structures/:id', requireRoles('admin', 'lecturer', 'student'), financeController.findOneFeeStructure);
router.patch('/fee-structures/:id', requireRoles('admin'), financeController.updateFeeStructure);
router.delete('/fee-structures/:id', requireRoles('admin'), financeController.removeFeeStructure);

// Payments
router.post('/payments', requireRoles('admin', 'student'), validationMiddleware(CreatePaymentDto), financeController.processPayment);
router.get('/payments', requireRoles('admin', 'lecturer'), financeController.findAllPayments);
router.get('/payments/student/:studentId', requireRoles('admin', 'lecturer', 'student'), financeController.findStudentPayments);
router.get('/payments/:id/receipt', requireRoles('admin', 'student'), financeController.getReceipt);

// Fee balance
router.get('/students/:studentId/balance', requireRoles('admin', 'lecturer', 'student'), financeController.getStudentFeeBalance);

// Financial statements report
router.get('/reports/statements', requireRoles('admin'), financeController.getFinancialStatements);

export default router;
