import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { UsersOptLogsModule } from './modules/users-opt-logs/users-opt-logs.module';
import { UploadModule } from './modules/upload/upload.module';
import { CaptchaModule } from './modules/captcha/captcha.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env.production'],
      load: [databaseConfig, jwtConfig],
    }),
    DatabaseModule,
    UsersModule,
    RolesModule,
    AuthModule,
    PermissionsModule,
    UsersOptLogsModule,
    UploadModule,
    CaptchaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
