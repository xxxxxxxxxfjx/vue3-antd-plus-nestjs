import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersOptLogsService } from './users-opt-logs.service';
import { CreateUsersOptLogDto } from './dto/create-users-opt-log.dto';

@ApiTags('操作日志')
@Controller('v1/users-opt-logs')
export class UsersOptLogsController {
  constructor(private readonly usersOptLogsService: UsersOptLogsService) {}

  @Post()
  @ApiOperation({ summary: '创建操作日志' })
  @ApiResponse({ status: 201, description: '日志创建成功' })
  create(@Body() createUsersOptLogDto: CreateUsersOptLogDto) {
    return this.usersOptLogsService.create(createUsersOptLogDto);
  }

  @Get()
  @ApiOperation({ summary: '获取操作日志列表' })
  @ApiResponse({ status: 200, description: '返回操作日志列表' })
  findAll(@Query() query: any) {
    return this.usersOptLogsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取操作日志详情' })
  @ApiResponse({ status: 200, description: '返回日志详情' })
  findOne(@Param('id') id: string) {
    return this.usersOptLogsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除操作日志' })
  @ApiResponse({ status: 204, description: '日志删除成功' })
  remove(@Param('id') id: string) {
    return this.usersOptLogsService.remove(id);
  }
}
