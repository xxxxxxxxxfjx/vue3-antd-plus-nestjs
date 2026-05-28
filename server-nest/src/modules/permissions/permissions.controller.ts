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
  async permissionsTree() {
    return this.permissionsService.findTree();
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
  async permissionsDelete(@Body('id') id: string) {
    return this.permissionsService.remove(id);
  }

  @Post('update')
  @ApiOperation({ summary: '更新权限信息' })
  async permissionsUpdate(@Body() body: UpdatePermissionDto & { id: string }) {
    const { id, ...updatePermissionDto } = body;
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Post('stop')
  @ApiOperation({ summary: '更新权限状态' })
  async permissionsStop(@Body() body: { id: string; status: boolean }) {
    return this.permissionsService.update(body.id, { status: body.status });
  }
}
