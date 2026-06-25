import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategies';
import { RefreshStrategy } from './strategies/refresh.strategies';
import { EmailModule } from '../email/email.module';
import { StudentsModule } from '../students/students.module';
import { LecturersModule } from '../lecturers/lecturer.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}),
    EmailModule,
    forwardRef(() => StudentsModule),
    LecturersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
