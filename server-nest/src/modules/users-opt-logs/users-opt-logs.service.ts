import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UsersOptLog,
  UsersOptLogDocument,
} from './schemas/users-opt-log.schema';
import { CreateUsersOptLogDto } from './dto/create-users-opt-log.dto';

@Injectable()
export class UsersOptLogsService {
  constructor(
    @InjectModel(UsersOptLog.name)
    private usersOptLogModel: Model<UsersOptLogDocument>,
  ) {}

  async create(
    createUsersOptLogDto: CreateUsersOptLogDto,
  ): Promise<UsersOptLog> {
    const createdLog = new this.usersOptLogModel(createUsersOptLogDto);
    return createdLog.save();
  }

  async findAll(query?: any): Promise<UsersOptLog[]> {
    const filter: any = {};
    if (query?.operator) {
      filter.operator = new RegExp(query.operator, 'i');
    }
    if (query?.module) {
      filter.module = query.module;
    }
    return this.usersOptLogModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(query?.limit || 100)
      .exec();
  }

  async findOne(id: string): Promise<UsersOptLog | null> {
    return this.usersOptLogModel.findById(id).exec();
  }

  async remove(id: string): Promise<void> {
    await this.usersOptLogModel.findByIdAndDelete(id).exec();
  }
}
