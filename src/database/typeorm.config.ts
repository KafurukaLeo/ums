/**
 * Module components file: typeorm.config.ts.
 */
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environmental variables
config();

/**
 * DataSource configuration optimized for TypeORM CLI operations.
 * Resolves paths to entities and migration scripts.
 */
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:leo%40ABC2025%21%21@localhost:5432/university',
  entities: [
    __dirname + '/../**/*.entity{.ts,.js}',
    __dirname + '/../**/*.entities{.ts,.js}'
  ],
  migrations: [
    __dirname + '/migrations/*{.ts,.js}'
  ],
  synchronize: true, // Automatically synchronize schema changes on startup
});
