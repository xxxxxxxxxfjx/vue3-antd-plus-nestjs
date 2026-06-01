import {
  Controller,
  Post,
  Body,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { UsersOptLogsService } from './users-opt-logs.service';
import { CreateUsersOptLogDto } from './dto/create-users-opt-log.dto';

@ApiTags('操作日志')
@Controller('v1/sys/users_opt_logs')
export class UsersOptLogsController {
  constructor(private readonly usersOptLogsService: UsersOptLogsService) {}

  @Post('list')
  @ApiOperation({ summary: '获取操作日志列表' })
  async list(@Body() query?: Record<string, any>) {
    return this.usersOptLogsService.findAll(query);
  }

  @Post('create')
  @ApiOperation({ summary: '创建操作日志' })
  async create(@Body() createUsersOptLogDto: CreateUsersOptLogDto) {
    return this.usersOptLogsService.create(createUsersOptLogDto);
  }

  @Post('update')
  @ApiOperation({ summary: '更新操作日志' })
  async update(@Body() body: CreateUsersOptLogDto & { _id: string }) {
    const { _id, ...updateDto } = body;
    return this.usersOptLogsService.update(_id, updateDto);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除操作日志' })
  async delete(@Body('_id') id: string) {
    return this.usersOptLogsService.remove(id);
  }

  @Post('deleteAll')
  @ApiOperation({ summary: '批量删除操作日志' })
  async deleteAll(@Body('ids') ids: string[]) {
    return this.usersOptLogsService.removeAll(ids);
  }

  @Post('export')
  @ApiOperation({ summary: '导出操作日志' })
  async export(@Body() query: Record<string, any>, @Res() res: Response) {
    return this.usersOptLogsService.exportExcel(query, res);
  }

  @Post('import')
  @ApiOperation({ summary: '导入操作日志' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择文件');
    }
    return this.usersOptLogsService.importExcel(file);
  }

  @Post('downloadTemplate')
  @ApiOperation({ summary: '下载导入模板' })
  async downloadTemplate(@Res() res: Response) {
    return this.usersOptLogsService.downloadTemplate(res);
  }
}
