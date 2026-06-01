import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@ApiTags('权限管理')
@Controller('v1/sys/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('tree')
  @ApiOperation({ summary: '获取权限树' })
  async permissionsTree(@Body() query?: Record<string, any>) {
    return this.permissionsService.findTree(query);
  }

  @Post('list')
  @ApiOperation({ summary: '获取权限列表' })
  async permissionsList(@Body() query?: Record<string, any>) {
    return this.permissionsService.findAll(query);
  }

  @Post('create')
  @ApiOperation({ summary: '创建权限' })
  async permissionsCreate(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除权限' })
  async permissionsDelete(@Body() body: { _id: string; key: string }) {
    return this.permissionsService.remove(body._id, body.key);
  }

  @Post('update')
  @ApiOperation({ summary: '更新权限信息' })
  async permissionsUpdate(@Body() body: UpdatePermissionDto & { _id: string }) {
    const { _id, ...updatePermissionDto } = body;
    return this.permissionsService.update(_id, updatePermissionDto);
  }

  @Post('stop')
  @ApiOperation({ summary: '更新权限状态' })
  async permissionsStop(@Body('_id') id: string) {
    return this.permissionsService.toggleStatus(id);
  }
}
