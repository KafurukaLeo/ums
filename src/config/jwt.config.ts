import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'super-secret-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-key',
}));
