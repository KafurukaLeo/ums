import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecturer } from './entities/lecturer.entity';
import { LecturerService } from './lecturer.service';
import { LecturerController } from './lecturer.controller';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lecturer]),
    CoursesModule,
  ],
  controllers: [LecturerController],
  providers: [LecturerService],
  exports: [LecturerService],
})
export class LecturersModule {}