/**
 * Module components file: connection.ts.
 */
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environmental configuration variables
config();

// Resolve connection URI from environment variables with fallback
const url = process.env.DATABASE_URL || 'postgresql://postgres:leo%40ABC2025%21%21@localhost:5432/university';

// Check if targeting a cloud-based SQL engine requiring SSL encryption
const isCloudDb = url.includes('neon.tech') || url.includes('supabase.co') || url.includes('elephantsql.com');

/**
 * Shared TypeORM DataSource configuration.
 * Configured with Postgres driver, entity search globs, schema synchronization, and conditional SSL flags.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url,
  entities: [
    path.join(__dirname, '/../**/*.entity{.ts,.js}'),
    path.join(__dirname, '/../**/*.entities{.ts,.js}'),
  ],
  synchronize: true, // Auto-sync entity changes (only for development)
  ssl: isCloudDb ? { rejectUnauthorized: false } : false,
});

/**
 * Initialize connection pool to the SQL Database.
 * Blocks application start if database is offline.
 */
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
  } catch (err) {
    console.error('Error during Data Source initialization:', err);
    throw err;
  }
};
