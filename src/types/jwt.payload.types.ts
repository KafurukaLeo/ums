export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  studentId?: number;
  lecturerId?: number;
}
