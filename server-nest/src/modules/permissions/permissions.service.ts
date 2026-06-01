import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto & { autoSon?: boolean }): Promise<Permission> {
    const existingPermission = await this.permissionModel.findOne({
      key: createPermissionDto.key,
    });

    if (existingPermission) {
      throw new ConflictException('权限键已存在');
    }

    const { autoSon, ...dto } = createPermissionDto as any;

    // 有且仅有一个冒号 并且 autoSon=true 时，自动生成 CRUD 子权限
    const colonCount = (dto.key.match(/:/g) || []).length;
    if (colonCount === 1 && autoSon) {
      const children = [
        { ...dto },
        { name: '查询', key: dto.key + ':list', parent_key: dto.key, auth: true },
        { name: '增加', key: dto.key + ':create', parent_key: dto.key, auth: true },
        { name: '删除', key: dto.key + ':delete', parent_key: dto.key, auth: true },
        { name: '更新', key: dto.key + ':update', parent_key: dto.key, auth: true },
      ];
      await this.permissionModel.insertMany(children);
      return children[0] as any;
    }

    const createdPermission = new this.permissionModel(dto);
    return createdPermission.save();
  }

  async findAll(query?: any): Promise<any> {
    const params = query?.params || {};
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
    ];

    const [result, total] = await Promise.all([
      this.permissionModel.aggregate(aggregationPipeline).exec(),
      this.permissionModel.countDocuments(params).exec(),
    ]);

    const resultData = (this.permissionModel as any).toTree(result);
    return resultData.length > 0
      ? { result: resultData }
      : { result: [] };
  }

  async findTree(query?: any): Promise<any> {
    const params = query?.params || {};
    const sortColumn = query?.sort?.columnKey || 'sortOrder';
    const sortOrder = query?.sort?.order === 'ascend' ? 1 : -1;

    const aggregationPipeline: any[] = [
      { $match: params },
      { $sort: { [sortColumn]: sortOrder } },
    ];

    const [result, total] = await Promise.all([
      this.permissionModel.aggregate(aggregationPipeline).exec(),
      this.permissionModel.countDocuments(params).exec(),
    ]);

    const resultData = (this.permissionModel as any).toTree(result);
    return resultData.length > 0
      ? { result: resultData }
      : { result: [] };
  }

  async findOne(id: string): Promise<Permission> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('无效的权限ID');
    }

    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new NotFoundException('权限不存在');
    }
    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('无效的权限ID');
    }

    const updatedPermission = await this.permissionModel
      .findByIdAndUpdate(id, updatePermissionDto, { new: true })
      .exec();

    if (!updatedPermission) {
      throw new NotFoundException('权限不存在');
    }

    return updatedPermission;
  }

  async remove(id: string, key?: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('无效的权限ID');
    }

    // 如果 key 有 0 或 1 个冒号，执行批量删除（匹配 key 及其子权限）
    if (key) {
      const colonCount = (key.match(/:/g) || []).length;
      if (colonCount === 0 || colonCount === 1) {
        await this.permissionModel.deleteMany({ key: { $regex: `.*${key}.*` } });
        return;
      }
    }

    const result = await this.permissionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('权限不存在');
    }
  }

  async toggleStatus(id: string): Promise<Permission> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('无效的权限ID');
    }

    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    permission.status = !permission.status;
    permission.disabled = !permission.disabled;
    return permission.save();
  }
}
