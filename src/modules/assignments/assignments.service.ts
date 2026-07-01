import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Assignment } from './entities/assignment.entity';
import { AssignmentSubmission } from './entities/assignment-submission.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

export class AssignmentsService {
  private get assignmentRepository() {
    return AppDataSource.getRepository(Assignment);
  }

  private get submissionRepository() {
    return AppDataSource.getRepository(AssignmentSubmission);
  }

  findAll(): Promise<Assignment[]> {
    return this.assignmentRepository.find({ order: { createdAt: 'DESC' } });
  }

  findByCourse(courseId: number): Promise<Assignment[]> {
    return this.assignmentRepository.find({
      where: { courseId },
      order: { dueDate: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOneBy({ id });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }

  create(dto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = this.assignmentRepository.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    return this.assignmentRepository.save(assignment);
  }

  async update(id: number, dto: UpdateAssignmentDto): Promise<Assignment> {
    const updateData: any = { ...dto };
    if (dto.dueDate) {
      updateData.dueDate = new Date(dto.dueDate);
    }
    await this.assignmentRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.assignmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
  }

  getSubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
    return this.submissionRepository.find({
      where: { assignmentId },
      order: { submittedAt: 'DESC' },
    });
  }

  getStudentSubmissions(studentId: number): Promise<AssignmentSubmission[]> {
    return this.submissionRepository.find({
      where: { studentId },
      order: { submittedAt: 'DESC' },
    });
  }

  async submitAssignment(
    assignmentId: number,
    dto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmission> {
    await this.findOne(assignmentId);

    const submission = this.submissionRepository.create({
      assignmentId,
      studentId: dto.studentId,
      submissionFileUrl: dto.submissionFileUrl,
      submissionText: dto.submissionText,
    });
    return this.submissionRepository.save(submission);
  }

  async findSubmission(id: number): Promise<AssignmentSubmission> {
    const submission = await this.submissionRepository.findOneBy({ id });
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return submission;
  }

  async gradeSubmission(
    submissionId: number,
    dto: GradeSubmissionDto,
  ): Promise<AssignmentSubmission> {
    const submission = await this.findSubmission(submissionId);
    await this.submissionRepository.update(submissionId, {
      grade: dto.grade,
      feedback: dto.feedback,
    });
    return this.findSubmission(submissionId);
  }
}

export const assignmentsService = new AssignmentsService();
