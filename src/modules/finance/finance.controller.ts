import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';
import { RequestWithUser } from '../../types/request-with-user.type';
import { StudentsService } from '../students/students.service';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly studentsService: StudentsService,
  ) {}

  // ─── FEE STRUCTURE ENDPOINTS ───────────────────────────────────────────────

  /**
   * POST /finance/fee-structures
   * Configures tuition fees for a program/semester (Admin only).
   */
  @Post('fee-structures')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Configure semester tuition fee structure — Admin only' })
  createFeeStructure(@Body() dto: CreateFeeStructureDto) {
    return this.financeService.createFeeStructure(dto);
  }

  /**
   * GET /finance/fee-structures
   * Returns all fee configurations (Admin, Lecturer, Student).
   */
  @Get('fee-structures')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all fee structures (Admin, Lecturer, Student)' })
  findAllFeeStructures() {
    return this.financeService.findAllFeeStructures();
  }

  /**
   * GET /finance/fee-structures/:id
   * Returns a specific fee configuration.
   */
  @Get('fee-structures/:id')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a specific fee structure by ID' })
  findOneFeeStructure(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.findOneFeeStructure(id);
  }

  /**
   * PATCH /finance/fee-structures/:id
   * Updates fee details (Admin only).
   */
  @Patch('fee-structures/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a fee structure — Admin only' })
  updateFeeStructure(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateFeeStructureDto>) {
    return this.financeService.updateFeeStructure(id, dto);
  }

  /**
   * DELETE /finance/fee-structures/:id
   * Deletes a fee configuration (Admin only).
   */
  @Delete('fee-structures/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a fee structure — Admin only' })
  removeFeeStructure(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.removeFeeStructure(id);
  }

  // ─── PAYMENT ENDPOINTS ──────────────────────────────────────────────────────

  /**
   * POST /finance/payments
   * Records a student tuition payment (Student/Admin).
   * 
   * Security Logic:
   * A non-admin student is forbidden from posting payments on behalf of other students.
   * We verify that the student profile corresponding to the user's email matches the payment studentId.
   */
  @Post('payments')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Post a tuition payment — Student/Admin only' })
  async processPayment(@Body() dto: CreatePaymentDto, @Req() req: RequestWithUser) {
    if (req.user.role !== Role.ADMIN) {
      // Find the student profile of the logged-in student
      const student = await this.studentsService.findByEmail(req.user.email);
      if (!student || student.id !== dto.studentId) {
        throw new ForbiddenException('You are not authorized to post payments for other students.');
      }
    }
    return this.financeService.processPayment(dto);
  }

  /**
   * GET /finance/payments
   * Returns all transactions (Admin, Lecturer).
   */
  @Get('payments')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Get all processed payments — Lecturer/Admin only' })
  findAllPayments() {
    return this.financeService.findAllPayments();
  }

  /**
   * GET /finance/payments/student/:studentId
   * Returns a student's payment history (Admin, Lecturer, Student).
   * 
   * Security Logic:
   * A student can only view their own payment transactions.
   */
  @Get('payments/student/:studentId')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get payment history for a specific student' })
  async findStudentPayments(@Param('studentId', ParseIntPipe) studentId: number, @Req() req: RequestWithUser) {
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.LECTURER) {
      const student = await this.studentsService.findByEmail(req.user.email);
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('You are not authorized to view this student\'s payment history.');
      }
    }
    return this.financeService.findStudentPayments(studentId);
  }

  /**
   * GET /finance/payments/:id/receipt
   * Returns the transaction details (receipt) for a payment (Admin, Student).
   * 
   * Security Logic:
   * A student can only retrieve a receipt for their own payment.
   */
  @Get('payments/:id/receipt')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Download or view a payment receipt' })
  async getReceipt(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const payment = await this.financeService.findPaymentById(id);

    if (req.user.role !== Role.ADMIN) {
      const student = await this.studentsService.findByEmail(req.user.email);
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
  }

  // ─── FEE BALANCE ENDPOINTS ─────────────────────────────────────────────────

  /**
   * GET /finance/students/:studentId/balance
   * Calculates a student's outstanding fees and clearance status (Admin, Lecturer, Student).
   * 
   * Security Logic:
   * A student can only view their own fee balance details.
   */
  @Get('students/:studentId/balance')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get current fee balance and clearance status for a student' })
  @ApiQuery({ name: 'academicYear', required: false, type: Number })
  @ApiQuery({ name: 'semester', required: false, type: Number })
  async getStudentFeeBalance(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() req: RequestWithUser,
    @Query('academicYear') academicYear?: number,
    @Query('semester') semester?: number,
  ) {
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.LECTURER) {
      const student = await this.studentsService.findByEmail(req.user.email);
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('You are not authorized to view this student\'s fee balance.');
      }
    }
    return this.financeService.getStudentFeeBalance(studentId, academicYear, semester);
  }

  // ─── FINANCIAL STATEMENT ENDPOINTS ─────────────────────────────────────────

  /**
   * GET /finance/reports/statements
   * Returns aggregate financial reports (Admin only).
   */
  @Get('reports/statements')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get aggregate university financial statements — Admin only' })
  getFinancialStatements() {
    return this.financeService.getFinancialStatements();
  }
}
