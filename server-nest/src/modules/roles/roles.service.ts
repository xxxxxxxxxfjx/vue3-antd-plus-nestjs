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

  async findAll(query?: any): Promise<Role[]> {
    const filter = {};
    if (query?.status !== undefined) {
      filter['status'] = query.status;
    }
    return this.roleModel.find(filter).exec();
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

    const result = await this.roleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('角色不存在');
    }
  }
}
