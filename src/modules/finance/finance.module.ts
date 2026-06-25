import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeStructure } from './entities/fee-structure.entity';
import { Payment } from './entities/payment.entity';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { StudentsModule } from '../students/students.module';

/**
 * FinanceModule registers the components of the UMS Finance Management system:
 * - Entity models: FeeStructure, Payment (via TypeOrmModule.forFeature)
 * - Service: FinanceService (business logic)
 * - Controller: FinanceController (REST endpoints)
 * - Imports StudentsModule to enable verifying student profiles and email mapping.
 */
@Module({
  imports: [
    // Register the TypeORM repositories for these entities in the current scope
    TypeOrmModule.forFeature([FeeStructure, Payment]),
    // Import StudentsModule to allow injecting StudentsService
    forwardRef(() => StudentsModule),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService], // Export it to allow other modules (like Students) to access balance checks
})
export class FinanceModule {}
