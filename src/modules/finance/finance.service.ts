/**
 * Module components file: finance.service.ts.
 */
import { NotFoundException, BadRequestException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { FeeStructure } from './entities/fee-structure.entity';
import { Payment } from './entities/payment.entity';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { studentsService } from '../students/students.service';

/**
 * Finance Service class.
 * Handles database operations for:
 * - Fee structure configurations (tuition requirements)
 * - Tuition payment transactions
 * - Balance calculation and financial summaries
 */
export class FinanceService {
  
  /**
   * Helper getter to resolve TypeORM repository for FeeStructure Entity.
   */
  private get feeStructureRepository() {
    return AppDataSource.getRepository(FeeStructure);
  }

  /**
   * Helper getter to resolve TypeORM repository for Payment Entity.
   */
  private get paymentRepository() {
    return AppDataSource.getRepository(Payment);
  }

  /**
   * Create a new fee structure configuration.
   * Throws BadRequestException if a configuration for the program, year, and semester combination already exists.
   */
  async createFeeStructure(dto: CreateFeeStructureDto): Promise<FeeStructure> {
    try {
      const feeStructure = this.feeStructureRepository.create(dto);
      return await this.feeStructureRepository.save(feeStructure);
    } catch (error) {
      throw new BadRequestException('Fee structure configuration for this program, academic year, and semester already exists.');
    }
  }

  /**
   * Fetch all configured fee structures.
   */
  async findAllFeeStructures(): Promise<FeeStructure[]> {
    return this.feeStructureRepository.find();
  }

  /**
   * Fetch a single fee structure by ID.
   */
  async findOneFeeStructure(id: number): Promise<FeeStructure> {
    const fs = await this.feeStructureRepository.findOneBy({ id });
    if (!fs) {
      throw new NotFoundException(`Fee structure with ID ${id} not found`);
    }
    return fs;
  }

  /**
   * Update an existing fee structure by ID.
   */
  async updateFeeStructure(id: number, dto: Partial<CreateFeeStructureDto>): Promise<FeeStructure> {
    await this.feeStructureRepository.update(id, dto);
    return this.findOneFeeStructure(id);
  }

  /**
   * Delete a fee structure configuration.
   */
  async removeFeeStructure(id: number): Promise<void> {
    const result = await this.feeStructureRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Fee structure with ID ${id} not found`);
    }
  }

  /**
   * Process a student tuition payment transaction.
   * - Confirms the student profile exists.
   * - Generates a unique receipt number with format: REC-YEAR-TIMESTAMP-RANDOM_SUFFIX.
   * - Saves the payment record to the database.
   */
  async processPayment(dto: CreatePaymentDto): Promise<Payment> {
    await studentsService.findOne(dto.studentId);

    // Generate unique receipt code
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `REC-${dto.academicYear}-${timestamp}-${randomSuffix}`;

    const payment = this.paymentRepository.create({
      ...dto,
      receiptNumber,
      paymentDate: new Date(),
    });

    return this.paymentRepository.save(payment);
  }

  /**
   * Fetch all payment records.
   */
  async findAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({ order: { paymentDate: 'DESC' } });
  }

  /**
   * Fetch all payment records posted by a specific student.
   */
  async findStudentPayments(studentId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { studentId },
      order: { paymentDate: 'DESC' },
    });
  }

  /**
   * Fetch a single payment transaction record by ID.
   */
  async findPaymentById(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) {
      throw new NotFoundException(`Payment record with ID ${id} not found`);
    }
    return payment;
  }

  /**
   * Calculate a student's outstanding tuition fee balance for a specific academic year and semester.
   * - Checks the student's program-specific fee structure.
   * - Falls back to a "General" fee structure config if program-specific is not configured.
   * - Subtracts total paid amount from total fee requirement.
   * - Status is 'CLEARED' if balance is 0.
   */
  async getStudentFeeBalance(studentId: number, academicYear?: number, semester?: number) {
    const student = await studentsService.findOne(studentId);
    
    const year = academicYear || new Date().getFullYear();
    const sem = semester || 1;

    // Load program-specific fee structure
    let feeStructure = await this.feeStructureRepository.findOneBy({
      program: student.program || '',
      academicYear: year,
      semester: sem,
    });

    // Fall back to general fee structure if not found
    if (!feeStructure) {
      feeStructure = await this.feeStructureRepository.findOneBy({
        program: 'General',
        academicYear: year,
        semester: sem,
      });
    }

    // Default to 1000.00 if no configurations exist
    const totalFeesDue = feeStructure ? feeStructure.totalAmount : 1000.0;

    // Aggregate student payments
    const payments = await this.findStudentPayments(studentId);
    const totalPaid = payments
      .filter(p => p.academicYear === year && p.semester === sem)
      .reduce((sum, p) => sum + p.amountPaid, 0);

    const outstandingBalance = Math.max(0, totalFeesDue - totalPaid);
    const status = outstandingBalance <= 0 ? 'CLEARED' : 'UNCLEARED';

    return {
      studentId: student.id,
      studentName: student.name,
      program: student.program || 'N/A',
      academicYear: year,
      semester: sem,
      totalFeesDue,
      totalPaid,
      outstandingBalance,
      status,
    };
  }

  /**
   * Generate general financial statement metrics for admin overview.
   * - Total fees collected.
   * - Total outstanding balance aggregated across all students.
   * - Transaction volume.
   */
  async getFinancialStatements() {
    const payments = await this.paymentRepository.find();
    const totalFeesCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

    const students = await studentsService.findAll();
    let totalOutstanding = 0;

    // Sum outstanding balances across all registered student profiles
    for (const student of students) {
      const balanceInfo = await this.getStudentFeeBalance(student.id);
      totalOutstanding += balanceInfo.outstandingBalance;
    }

    return {
      totalFeesCollected,
      totalOutstanding,
      totalTransactions: payments.length,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance of FinanceService
export const financeService = new FinanceService();
