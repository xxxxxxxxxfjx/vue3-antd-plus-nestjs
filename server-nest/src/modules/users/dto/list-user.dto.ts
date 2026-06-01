import { IsOptional, IsString, IsInt, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

class SortDto {
  @ApiPropertyOptional({ description: '排序字段', default: 'createdAt' })
  @IsOptional()
  @IsString()
  columnKey?: string;

  @ApiPropertyOptional({ description: '排序方向', enum: ['ascend', 'descend'], default: 'descend' })
  @IsOptional()
  @IsString()
  order?: 'ascend' | 'descend';
}

class PaginationDto {
  @ApiPropertyOptional({ description: '当前页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  current?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

class ListUserParamsDto {
  @ApiPropertyOptional({ description: '用户名搜索（模糊匹配）' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '昵称搜索（模糊匹配）' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱搜索（模糊匹配）' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: '状态筛选' })
  @IsOptional()
  status?: boolean;

  @ApiPropertyOptional({ description: '角色ID筛选' })
  @IsOptional()
  @IsString()
  roleId?: string;
}

export class ListUserDto {
  @ApiPropertyOptional({ description: '查询参数' })
  @IsOptional()
  @Type(() => ListUserParamsDto)
  @IsObject()
  params?: ListUserParamsDto;

  @ApiPropertyOptional({ description: '分页参数' })
  @IsOptional()
  @Type(() => PaginationDto)
  pagination?: PaginationDto;

  @ApiPropertyOptional({ description: '排序参数' })
  @IsOptional()
  @Type(() => SortDto)
  sort?: SortDto;
}
