import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('用户管理')
@Controller('v1/sys/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('list')
  @ApiOperation({ summary: '获取用户列表' })
  async usersList(@Body() query?: Record<string, any>) {
    return this.usersService.findAll(query);
  }

  @Post('create')
  @ApiOperation({ summary: '创建用户' })
  async usersCreate(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除用户' })
  async usersDelete(@Body('_id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('update')
  @ApiOperation({ summary: '更新用户信息' })
  async usersUpdate(@Body() body: UpdateUserDto & { _id: string }) {
    const { _id, ...updateUserDto } = body;
    return this.usersService.update(_id, updateUserDto);
  }

  @Post('reset')
  @ApiOperation({ summary: '重置用户密码' })
  async usersReset(@Body() body: { _id: string; newPassword: string }) {
    return this.usersService.update(body._id, { password: body.newPassword });
  }

  @Post('findOne')
  @ApiOperation({ summary: '获取用户信息' })
  async usersFindOne(@Body('_id') id: string) {
    return this.usersService.findOne(id);
  }
}
