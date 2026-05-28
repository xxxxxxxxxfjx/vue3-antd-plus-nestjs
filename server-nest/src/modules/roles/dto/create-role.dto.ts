import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsString()
  roleName: string;

  @ApiProperty({ description: '角色标识' })
  @IsString()
  roleAuth: string;

  @ApiPropertyOptional({ description: '权限列表', type: [String] })
  @IsOptional()
  @IsArray()
  perms?: string[];

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({
    description: '状态: false禁用 true正常',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
