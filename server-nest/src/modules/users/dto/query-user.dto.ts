import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional({ description: '用户名搜索' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '昵称搜索' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱搜索' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: '状态筛选' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({ description: '角色ID筛选' })
  @IsOptional()
  @IsString()
  roleId?: string;
}
