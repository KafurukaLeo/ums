import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeStructure } from './entities/fee-structure.entity';
import { Payment } from './entities/payment.entity';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { StudentsService } from '../students/students.service';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FeeStructure)
    private readonly feeStructureRepository: Repository<FeeStructure>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    // Inject StudentsService to verify student status and retrieve program details
    private readonly studentsService: StudentsService,
  ) {}

  // ─── FEE STRUCTURE MANAGEMENT ──────────────────────────────────────────────

  /**
   * Creates a new fee structure configuration for a program.
   * 
   * Logic:
   * Saves the fee requirements in the fee_structures table.
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
   * Retrieves all configured fee structures.
   */
  async findAllFeeStructures(): Promise<FeeStructure[]> {
    return this.feeStructureRepository.find();
  }

  /**
   * Retrieves a single fee structure by ID.
   */
  async findOneFeeStructure(id: number): Promise<FeeStructure> {
    const fs = await this.feeStructureRepository.findOneBy({ id });
    if (!fs) {
      throw new NotFoundException(`Fee structure with ID ${id} not found`);
    }
    return fs;
  }

  /**
   * Updates an existing fee structure.
   */
  async updateFeeStructure(id: number, dto: Partial<CreateFeeStructureDto>): Promise<FeeStructure> {
    await this.feeStructureRepository.update(id, dto);
    return this.findOneFeeStructure(id);
  }

  /**
   * Deletes a fee structure.
   */
  async removeFeeStructure(id: number): Promise<void> {
    const result = await this.feeStructureRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Fee structure with ID ${id} not found`);
    }
  }

  // ─── TUITION PAYMENT PROCESS ────────────────────────────────────────────────

  /**
   * Processes a student payment.
   * 
   * Logic:
   * 1. Verifies the student exists in the database.
   * 2. Generates a unique, structured receipt number (e.g. REC-2026-17189012345).
   * 3. Creates and saves the payment record.
   */
  async processPayment(dto: CreatePaymentDto): Promise<Payment> {
    // 1. Verify student exists
    await this.studentsService.findOne(dto.studentId);

    // 2. Generate a unique receipt number
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `REC-${dto.academicYear}-${timestamp}-${randomSuffix}`;

    // 3. Save the payment
    const payment = this.paymentRepository.create({
      ...dto,
      receiptNumber,
      paymentDate: new Date(),
    });

    return this.paymentRepository.save(payment);
  }

  /**
   * Retrieves all payments in the system.
   */
  async findAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({ order: { paymentDate: 'DESC' } });
  }

  /**
   * Retrieves payments made by a specific student.
   */
  async findStudentPayments(studentId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { studentId },
      order: { paymentDate: 'DESC' },
    });
  }

  /**
   * Retrieves payment details by ID (used for receipt generation).
   */
  async findPaymentById(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) {
      throw new NotFoundException(`Payment record with ID ${id} not found`);
    }
    return payment;
  }

  // ─── FEE BALANCE REPORTS & CALCULATIONS ────────────────────────────────────

  /**
   * Calculates a student's fee summary and outstanding balance.
   * 
   * Logic:
   * 1. Fetches the student details to check their program (e.g. "Computer Science").
   * 2. Retrieves the FeeStructure configured for their program, current academic year, and semester.
   * 3. Sums up all payments made by this student.
   * 4. Computes: Outstanding = Total Fees Due - Total Paid.
   * 5. Determines clearance status (CLEARED if balance <= 0, otherwise UNCLEARED).
   */
  async getStudentFeeBalance(studentId: number, academicYear?: number, semester?: number) {
    // 1. Fetch student
    const student = await this.studentsService.findOne(studentId);
    
    // Set default academic year and semester if not supplied
    const year = academicYear || new Date().getFullYear();
    const sem = semester || 1;

    // 2. Fetch FeeStructure for student's program (or default fee structure if program-specific is not found)
    let feeStructure = await this.feeStructureRepository.findOneBy({
      program: student.program || '',
      academicYear: year,
      semester: sem,
    });

    // Fallback: search for a global or blank program fee structure if specific one not found
    if (!feeStructure) {
      feeStructure = await this.feeStructureRepository.findOneBy({
        program: 'General',
        academicYear: year,
        semester: sem,
      });
    }

    const totalFeesDue = feeStructure ? feeStructure.totalAmount : 1000.0; // Default fallback amount if none configured

    // 3. Sum all payments made by this student
    const payments = await this.findStudentPayments(studentId);
    const totalPaid = payments
      .filter(p => p.academicYear === year && p.semester === sem)
      .reduce((sum, p) => sum + p.amountPaid, 0);

    // 4. Calculate balance
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
   * Generates a summary statement of the university's finances.
   * 
   * Logic:
   * 1. Sums all payments processed.
   * 2. Iterates over all students to compute their cumulative outstanding balance.
   */
  async getFinancialStatements() {
    // 1. Total payments processed
    const payments = await this.paymentRepository.find();
    const totalFeesCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

    // 2. Compute outstanding balances
    const students = await this.studentsService.findAll();
    let totalOutstanding = 0;

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
