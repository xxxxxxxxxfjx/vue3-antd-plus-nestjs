import { Controller, Get, Session } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CaptchaService } from './captcha.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('验证码')
@Controller('v1/sys/auth')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Get('captcha')
  @Public()
  @ApiOperation({ summary: '获取数学表达式验证码' })
  @ApiResponse({
    status: 200,
    description: '验证码生成成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '成功' },
        data: { type: 'string', description: 'SVG 图片数据' },
      },
    },
  })
  getCaptcha(@Session() session: Record<string, any>) {
    // 生成数学表达式验证码（与原项目一致）
    const options = {
      noise: Math.floor(Math.random() * 5), // 随机线条数
      color: true,
      fontSize: 55,
      width: 90,
      height: 38,
    };

    const captcha = this.captchaService.generateMathCaptcha(options);

    // 存储到 session（与原项目一致）
    session.code = captcha.text;

    // 直接返回 SVG 数据
    return captcha.data;
  }
}
