import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import type { Response } from 'express';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  constructor() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const filename = `${Date.now()}-${file.originalname}`;
    const url = `/uploads/${filename}`;

    return {
      filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url,
      path: join(this.uploadPath, filename),
    };
  }

  async uploadFiles(files: Express.Multer.File[]) {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }

  getFile(filename: string, res: Response) {
    const filePath = join(this.uploadPath, filename);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('文件不存在');
    }

    return res.sendFile(filePath);
  }

  async deleteFile(filename: string) {
    const filePath = join(this.uploadPath, filename);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('文件不存在');
    }

    unlinkSync(filePath);
    return { message: '文件删除成功' };
  }
}
