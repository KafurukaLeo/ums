import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LecturersModule } from './modules/lecturers/lecturer.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { GradesModule } from './modules/grades/grades.module';
import { StudentsModule } from './modules/students/students.module';
import { UsersModule } from './modules/users/users.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AdminModule } from './modules/admin/admin.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { FinanceModule } from './modules/finance/finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    LecturersModule,
    DepartmentsModule,
    CoursesModule,
    EnrollmentsModule,
    GradesModule,
    StudentsModule,
    UsersModule,
    AttendanceModule,
    AdminModule,
    DashboardModule,
    AuthModule,
    // AssignmentsModule: handles lecturer assignment uploads and student submissions
    AssignmentsModule,
    // FinanceModule: handles student fee configurations, payments and balance checks
    FinanceModule,
  ],
})
export class AppModule {}