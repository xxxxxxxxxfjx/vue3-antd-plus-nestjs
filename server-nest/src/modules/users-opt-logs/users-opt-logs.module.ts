import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersOptLogsService } from './users-opt-logs.service';
import { UsersOptLogsController } from './users-opt-logs.controller';
import { UsersOptLog, UsersOptLogSchema } from './schemas/users-opt-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsersOptLog.name, schema: UsersOptLogSchema },
    ]),
  ],
  controllers: [UsersOptLogsController],
  providers: [UsersOptLogsService],
  exports: [UsersOptLogsService],
})
export class UsersOptLogsModule {}
