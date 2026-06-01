import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import {
  UsersOptLog,
  UsersOptLogDocument,
} from './schemas/users-opt-log.schema';
import { CreateUsersOptLogDto } from './dto/create-users-opt-log.dto';
import { ExcelUtil } from '../../common/utils/excel.util';

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

  async findAll(query?: any): Promise<any> {
    const params = query?.params || {};
    const current = Number(query?.pagination?.current || 1) || 1;
    const pageSize = Number(query?.pagination?.pageSize || 15) || 15;
    const sortColumn = query?.sort?.columnKey || 'createdAt';
    const sortOrder = query?.sort?.order === 'ascend' ? 1 : -1;

    const fuzzyParams: Record<string, any> = {};
    for (const key in params) {
      if (params.hasOwnProperty(key) && params[key]) {
        fuzzyParams[key] = { $regex: new RegExp(params[key], 'i') };
      }
    }

    const aggregationPipeline: any[] = [
      { $match: fuzzyParams },
      { $sort: { [sortColumn]: sortOrder } },
      { $skip: (current - 1) * pageSize },
      { $limit: pageSize },
    ];

    const [result, total] = await Promise.all([
      this.usersOptLogModel.aggregate(aggregationPipeline).exec(),
      this.usersOptLogModel.countDocuments(params).exec(),
    ]);

    return result.length > 0
      ? { result, current, pageSize, total }
      : { result: [], total };
  }

  async findOne(id: string): Promise<UsersOptLog | null> {
    return this.usersOptLogModel.findById(id).exec();
  }

  async update(
    id: string,
    updateDto: Partial<CreateUsersOptLogDto>,
  ): Promise<UsersOptLog> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('无效的操作日志ID');
    }

    const existing = await this.usersOptLogModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('该操作日志不存在');
    }

    const updated = await this.usersOptLogModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('操作日志更新失败');
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('无效的操作日志ID');
    }

    const result = await this.usersOptLogModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('该操作日志不存在或已被删除');
    }
  }

  async removeAll(ids: string[]): Promise<void> {
    await this.usersOptLogModel.deleteMany({ _id: { $in: ids } }).exec();
  }

  async exportExcel(query: any, res: Response): Promise<void> {
    const params = query?.params || {};
    const sortColumn = query?.sort?.columnKey || 'createdAt';
    const sortOrder = query?.sort?.order === 'ascend' ? 1 : -1;

    const fuzzyParams: Record<string, any> = {};
    for (const key in params) {
      if (params.hasOwnProperty(key) && params[key]) {
        fuzzyParams[key] = { $regex: new RegExp(params[key], 'i') };
      }
    }

    const data = await this.usersOptLogModel
      .aggregate([{ $match: fuzzyParams }, { $sort: { [sortColumn]: sortOrder } }])
      .exec();

    await ExcelUtil.export({
      data,
      filename: '操作日志.xlsx',
      res,
    });
  }

  async importExcel(file: Express.Multer.File): Promise<void> {
    const filePath = path.join(process.cwd(), file.path);
    try {
      const jsonData = await ExcelUtil.toJson(filePath);
      if (jsonData && jsonData.length) {
        await this.usersOptLogModel.insertMany(jsonData);
      }
      // 删除上传的文件
      await fs.promises.unlink(filePath).catch(() => {});
    } catch (err) {
      // 删除上传的文件
      await fs.promises.unlink(filePath).catch(() => {});
      throw err;
    }
  }

  async downloadTemplate(res: Response): Promise<void> {
    const fileName = '操作日志导入模板.xlsx';
    const filePath = 'uploads/excel';
    const fileFullPath = path.join(process.cwd(), filePath, fileName);
    await ExcelUtil.download(fileFullPath, fileName, res);
  }
}
