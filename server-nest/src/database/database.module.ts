import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbUrl = configService.get<string>('database.url');
        const dbPort = configService.get<number>('database.port');
        const dbName = configService.get<string>('database.name');
        const uri = `mongodb://${dbUrl}:${dbPort}/${dbName}`;

        return {
          uri,
          retryAttempts: 3,
          retryDelay: 1000,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
