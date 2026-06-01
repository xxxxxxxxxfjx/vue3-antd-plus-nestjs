import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { UploadService } from './upload.service';
import { multerConfig } from './config/multer.config';
import { FILE_MESSAGES } from '../../common/constants/file.constants';

@ApiTags('文件上传')
@Controller('v1/common')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @ApiOperation({ summary: '文件上传' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(FILE_MESSAGES.NO_FILE);
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3090';
    return {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `${baseUrl}/uploads/${file.filename}`,
      previewUrl: `${baseUrl}/v1/common/upload/file/${file.filename}`,
    };
  }

  @Get('upload/file/:filename')
  @ApiOperation({ summary: '文件预览或下载' })
  file(@Param('filename') filename: string, @Res() res: Response) {
    return this.uploadService.getFile(filename, res);
  }

  @Get('upload/delete/:filename')
  @ApiOperation({ summary: '删除文件' })
  async deleteFile(@Param('filename') filename: string) {
    await this.uploadService.deleteFile(filename);
    return { message: '文件删除成功' };
  }

  @Get('files/delete/img/:filename')
  @ApiOperation({ summary: '删除图片文件' })
  async deleteImg(@Param('filename') filename: string) {
    await this.uploadService.deleteFile(filename);
    return { message: '文件删除成功' };
  }

  @Get('files/delete/media/:filename')
  @ApiOperation({ summary: '删除媒体文件' })
  async deleteMedia(@Param('filename') filename: string) {
    await this.uploadService.deleteFile(filename);
    return { message: '文件删除成功' };
  }

  @Get('files/delete/files/:filename')
  @ApiOperation({ summary: '删除文件' })
  async deleteFilesFile(@Param('filename') filename: string) {
    await this.uploadService.deleteFile(filename);
    return { message: '文件删除成功' };
  }
}
