/**
 * Module components file: finance.controller.ts.
 */
import { Response } from 'express';
import { financeService } from './finance.service';
import { studentsService } from '../students/students.service';
import { ForbiddenException } from '../../common/exceptions/http.exception';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller to handle all financial endpoints including:
 * - Fee structures (tuition configurations)
 * - Student tuition payments processing
 * - Student balances and official receipt generation
 * - General financial summary reports
 */
export class FinanceController {
  
  /**
   * Create a new fee structure configuration.
   * Admin-only permission (enforced in routing configuration).
   */
  createFeeStructure = asyncHandler(async (req: any, res: Response) => {
    const result = await financeService.createFeeStructure(req.body);
    return result;
  });

  /**
   * Retrieve all configured fee structures.
   */
  findAllFeeStructures = asyncHandler(async (req: any, res: Response) => {
    const result = await financeService.findAllFeeStructures();
    return result;
  });

  /**
   * Fetch a single fee structure config by ID.
   */
  findOneFeeStructure = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await financeService.findOneFeeStructure(id);
    return result;
  });

  /**
   * Update an existing fee structure configuration by ID.
   */
  updateFeeStructure = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await financeService.updateFeeStructure(id, req.body);
    return result;
  });

  /**
   * Delete a fee structure configuration.
   */
  removeFeeStructure = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await financeService.removeFeeStructure(id);
    return null;
  });

  /**
   * Process a student tuition payment transaction.
   * - Admins can process payments for any student.
   * - Students can only submit/post payments for their own profile.
   */
  processPayment = asyncHandler(async (req: any, res: Response) => {
    const dto = req.body;
    
    // Authorization check: Students cannot post payments on behalf of other students
    if (req.user.role !== 'admin') {
      const student = await studentsService.findByEmail(req.user.email);
      if (!student || student.id !== dto.studentId) {
        throw new ForbiddenException('You are not authorized to post payments for other students.');
      }
    }
    const result = await financeService.processPayment(dto);
    return result;
  });

  /**
   * Fetch all payment transactions.
   * Admin-only view.
   */
  findAllPayments = asyncHandler(async (req: any, res: Response) => {
    const result = await financeService.findAllPayments();
    return result;
  });

  /**
   * Fetch payment history for a specific student.
   * - Admins/Lecturers can view any student's history.
   * - Students can only access their own history list.
   */
  findStudentPayments = asyncHandler(async (req: any, res: Response) => {
    const studentId = parseInt(req.params.studentId, 10);
    
    // Permissions validation
    if (req.user.role !== 'admin' && req.user.role !== 'lecturer') {
      const student = await studentsService.findByEmail(req.user.email);
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('You are not authorized to view this student\'s payment history.');
      }
    }
    const result = await financeService.findStudentPayments(studentId);
    return result;
  });

  /**
   * Generate an official Payment Receipt for a successful transaction.
   * - Students can only access their own receipts.
   */
  getReceipt = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const payment = await financeService.findPaymentById(id);

    // Validate access permissions
    if (req.user.role !== 'admin') {
      const student = await studentsService.findByEmail(req.user.email);
      if (!student || student.id !== payment.studentId) {
        throw new ForbiddenException('You are not authorized to view this receipt.');
      }
    }

    return {
      documentType: 'PAYMENT_RECEIPT',
      title: 'University Management System — Payment Receipt',
      receiptNumber: payment.receiptNumber,
      paymentDate: payment.paymentDate,
      amountPaid: payment.amountPaid,
      academicYear: payment.academicYear,
      semester: payment.semester,
      studentId: payment.studentId,
      status: 'PAID',
    };
  });

  /**
   * Retrieve tuition fee balance and clearance status for a student.
   * - Restricts regular student access to their own data.
   */
  getStudentFeeBalance = asyncHandler(async (req: any, res: Response) => {
    const studentId = parseInt(req.params.studentId, 10);
    
    // Parse query parameters
    const academicYear = req.query.academicYear ? parseInt(req.query.academicYear as string, 10) : undefined;
    const semester = req.query.semester ? parseInt(req.query.semester as string, 10) : undefined;

    // Validate access permissions
    if (req.user.role !== 'admin' && req.user.role !== 'lecturer') {
      const student = await studentsService.findByEmail(req.user.email);
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('You are not authorized to view this student\'s fee balance.');
      }
    }

    const result = await financeService.getStudentFeeBalance(studentId, academicYear, semester);
    return result;
  });

  /**
   * Fetch cumulative financial statement metrics (total fees due, total fees collected, outstanding).
   * Admin-only.
   */
  getFinancialStatements = asyncHandler(async (req: any, res: Response) => {
    const result = await financeService.getFinancialStatements();
    return result;
  });
}

// Export singleton instance
export const financeController = new FinanceController();
