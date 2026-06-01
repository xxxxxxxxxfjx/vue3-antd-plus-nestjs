import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleModel.findOne({
      roleName: createRoleDto.roleName,
    });

    if (existingRole) {
      throw new ConflictException('角色名称已存在');
    }

    const createdRole = new this.roleModel(createRoleDto);
    return createdRole.save();
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
      this.roleModel.aggregate(aggregationPipeline).exec(),
      this.roleModel.countDocuments(params).exec(),
    ]);

    return result.length > 0
      ? { result, current, pageSize, total }
      : { result: [], total };
  }

  async findOne(id: string): Promise<Role> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('无效的角色ID');
    }

    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('无效的角色ID');
    }

    const roleInfo = await this.roleModel.findById(id).exec();
    if (!roleInfo) {
      throw new NotFoundException('角色不存在');
    }
    if (roleInfo.roleAuth === 'SUPER-ADMIN') {
      throw new ConflictException('不能修改超级管理员');
    }

    const updatedRole = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .exec();

    if (!updatedRole) {
      throw new NotFoundException('角色不存在');
    }

    return updatedRole;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('无效的角色ID');
    }

    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    if (role.roleAuth === 'SUPER-ADMIN') {
      throw new ConflictException('不能删除超级管理员角色');
    }
    if (role.roleAuth === 'VISITOR-ADMIN') {
      throw new ConflictException('不能删除访客管理员角色');
    }

    await this.roleModel.findByIdAndDelete(id).exec();
  }
}
