import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

const url = process.env.DATABASE_URL || 'postgresql://postgres:leo%40ABC2025%21%21@localhost:5432/university';
const isCloudDb = url.includes('neon.tech') || url.includes('supabase.co') || url.includes('elephantsql.com');

export const AppDataSource = new DataSource({
  type: 'postgres',
  url,
  entities: [
    path.join(__dirname, '/../**/*.entity{.ts,.js}'),
    path.join(__dirname, '/../**/*.entities{.ts,.js}'),
  ],
  synchronize: true,
  ssl: isCloudDb ? { rejectUnauthorized: false } : false,
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
  } catch (err) {
    console.error('Error during Data Source initialization:', err);
    throw err;
  }
};
