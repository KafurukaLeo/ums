import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:leo%40ABC2025%21%21@localhost:5432/university',
  entities: [__dirname + '/../**/*.entity{.ts,.js}', __dirname + '/../**/*.entities{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: true,
});
