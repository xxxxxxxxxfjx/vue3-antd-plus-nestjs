import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '权限键' })
  @IsString()
  key: string;

  @ApiPropertyOptional({ description: '父级权限键' })
  @IsOptional()
  @IsString()
  parent_key?: string;

  @ApiPropertyOptional({ description: '是否是权限按钮', default: false })
  @IsOptional()
  @IsBoolean()
  auth?: boolean;

  @ApiPropertyOptional({ description: '排序字段', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: '状态: false禁用 true正常',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({
    description: '是否禁用: false正常 true禁用',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}
