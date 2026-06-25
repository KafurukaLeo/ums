import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('DATABASE_URL') || 'postgresql://postgres:leo%40ABC2025%21%21@localhost:5432/university';
        const isCloudDb = url.includes('neon.tech') || url.includes('supabase.co') || url.includes('elephantsql.com');
        
        return {
          type: 'postgres',
          url,
          autoLoadEntities: true,
          synchronize: true,
          ssl: isCloudDb ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}