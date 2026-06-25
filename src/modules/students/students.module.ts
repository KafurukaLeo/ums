import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { UsersModule } from '../users/users.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { CoursesModule } from '../courses/courses.module';
import { FinanceModule } from '../finance/finance.module';
import { AssignmentsModule } from '../assignments/assignments.module';
import { GradesModule } from '../grades/grades.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    UsersModule,
    EnrollmentsModule,
    CoursesModule,
    forwardRef(() => FinanceModule),
    AssignmentsModule,
    GradesModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
