import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://postgres:leo%40ABC2025%21%21@localhost:5432/university',
}));
