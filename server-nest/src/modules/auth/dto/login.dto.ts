import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '密码', example: 'admin123' })
  @IsString()
  @MinLength(3, { message: '密码长度不能少于3位' })
  password: string;

  @ApiProperty({ description: '验证码', example: '5' })
  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  code: string;
}
