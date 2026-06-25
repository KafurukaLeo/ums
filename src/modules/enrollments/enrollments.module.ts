import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './enrollment.entities';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment])],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
