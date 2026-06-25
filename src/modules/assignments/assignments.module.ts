import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { AssignmentSubmission } from './entities/assignment-submission.entity';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { CoursesModule } from '../courses/courses.module';

/**
 * AssignmentsModule bundles together the Assignment entities, service, and controller.
 * - TypeOrmModule.forFeature registers the Assignment and AssignmentSubmission entities
 *   so TypeORM injects their repositories into AssignmentsService.
 * - AssignmentsService is exported so other modules can inject it if needed.
 */
@Module({
  imports: [
    // Register both entities so their repositories are available via @InjectRepository()
    TypeOrmModule.forFeature([Assignment, AssignmentSubmission]),
    CoursesModule,
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
