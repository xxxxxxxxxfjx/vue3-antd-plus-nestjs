import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsersOptLogDto {
  @ApiPropertyOptional({ description: '操作人' })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiPropertyOptional({ description: '操作人ID' })
  @IsOptional()
  @IsString()
  operatorId?: string;

  @ApiPropertyOptional({ description: '操作模块' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ description: '操作平台' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ description: '设备IP' })
  @IsOptional()
  @IsString()
  operatorIP?: string;

  @ApiPropertyOptional({ description: '设备位置' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '操作内容' })
  @IsOptional()
  @IsString()
  content?: string;
}
