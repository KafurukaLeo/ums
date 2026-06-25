import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grades.entity';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade]),
    EnrollmentsModule,
  ],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
