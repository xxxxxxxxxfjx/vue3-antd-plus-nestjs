import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCaptchaDto {
  @ApiProperty({ description: '验证码标识' })
  @IsString()
  @IsNotEmpty({ message: '验证码标识不能为空' })
  key: string;

  @ApiProperty({ description: '验证码' })
  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
