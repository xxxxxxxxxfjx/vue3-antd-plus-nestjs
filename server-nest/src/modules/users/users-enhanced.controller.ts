import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  LogOperation,
  Roles,
  RequirePermissions,
  CurrentUser,
  ApiPaginatedResponse,
} from '../../common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import type { RequestUser } from '../../common/interfaces/user.interface';
import { ExcelUtil, ExcelColumn } from '../../common/utils/excel.util';

@ApiTags('用户管理（增强版）')
@Controller('v1/users-enhanced')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(LoggingInterceptor)
@ApiBearerAuth()
export class UsersEnhancedController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin', 'manager')
  @RequirePermissions('user:create')
  @LogOperation({ module: '用户管理', action: '创建用户' })
  @ApiOperation({ summary: '创建用户（需要权限）' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: RequestUser,
  ) {
    console.log('当前操作用户:', user);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询用户列表' })
  @ApiPaginatedResponse(CreateUserDto)
  async findAll(@Query() queryDto: QueryUserDto) {
    // 这里应该调用支持分页的 service 方法
    // const result = await this.usersService.findAllPaginated(queryDto);
    // return result;
    return this.usersService.findAll(queryDto);
  }

  @Get('export')
  @Roles('admin')
  @RequirePermissions('user:export')
  @LogOperation({ module: '用户管理', action: '导出用户数据' })
  @ApiOperation({ summary: '导出用户数据为 Excel' })
  @ApiResponse({ status: 200, description: '导出成功' })
  async exportUsers(@Res() res: Response, @Query() queryDto: QueryUserDto) {
    const users = await this.usersService.findAll(queryDto);

    const columns: ExcelColumn[] = [
      { header: '用户名', key: 'username', width: 20 },
      { header: '昵称', key: 'nickname', width: 20 },
      { header: '邮箱', key: 'email', width: 30 },
      { header: '状态', key: 'status', width: 10 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ];

    const data = users.map((user: any) => ({
      username: user.username,
      nickname: user.nickname,
      email: user.email || '-',
      status: user.status ? '正常' : '禁用',
      createdAt: user.createdAt,
    }));

    await ExcelUtil.exportToExcel(data, columns, '用户列表', res);
  }

  @Get('template')
  @ApiOperation({ summary: '下载用户导入模板' })
  async downloadTemplate(@Res() res: Response) {
    const columns: ExcelColumn[] = [
      { header: '用户名*', key: 'username', width: 20 },
      { header: '昵称*', key: 'nickname', width: 20 },
      { header: '密码*', key: 'password', width: 20 },
      { header: '邮箱', key: 'email', width: 30 },
      { header: '备注', key: 'remark', width: 30 },
    ];

    await ExcelUtil.createTemplate(columns, '用户导入', res);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @RequirePermissions('user:update')
  @LogOperation({ module: '用户管理', action: '更新用户' })
  @ApiOperation({ summary: '更新用户信息（需要权限）' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @RequirePermissions('user:delete')
  @LogOperation({ module: '用户管理', action: '删除用户' })
  @ApiOperation({ summary: '删除用户（仅管理员）' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
