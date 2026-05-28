import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('角色管理')
@Controller('v1/sys/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('list')
  @ApiOperation({ summary: '获取角色列表' })
  async rolesList(@Body() query?: Record<string, any>) {
    return this.rolesService.findAll(query);
  }

  @Post('create')
  @ApiOperation({ summary: '创建角色' })
  async rolesCreate(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除角色' })
  async rolesDelete(@Body('_id') id: string) {
    return this.rolesService.remove(id);
  }

  @Post('update')
  @ApiOperation({ summary: '更新角色信息' })
  async rolesUpdate(@Body() body: UpdateRoleDto & { _id: string }) {
    const { _id, ...updateRoleDto } = body;
    return this.rolesService.update(_id, updateRoleDto);
  }

  @Post('findOne')
  @ApiOperation({ summary: '查找指定的角色信息' })
  async rolesFindOne(@Body('_id') id: string) {
    return this.rolesService.findOne(id);
  }
}
