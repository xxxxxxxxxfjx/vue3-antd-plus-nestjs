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

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionModel.findOne({
      key: createPermissionDto.key,
    });

    if (existingPermission) {
      throw new ConflictException('权限键已存在');
    }

    const createdPermission = new this.permissionModel(createPermissionDto);
    return createdPermission.save();
  }

  async findAll(query?: any): Promise<Permission[]> {
    const filter: any = {};
    if (query?.status !== undefined) {
      filter.status = query.status;
    }
    return this.permissionModel.find(filter).sort({ sortOrder: 1 }).exec();
  }

  async findTree(): Promise<any[]> {
    const permissions = await this.permissionModel
      .find()
      .sort({ sortOrder: 1 })
      .lean()
      .exec();
    return (this.permissionModel as any).toTree(permissions);
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

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('无效的权限ID');
    }

    const result = await this.permissionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('权限不存在');
    }
  }
}
