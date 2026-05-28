import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VERIFY_CAPTCHA_KEY } from '../decorators/verify-captcha.decorator';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireCaptcha = this.reflector.getAllAndOverride<boolean>(
      VERIFY_CAPTCHA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireCaptcha) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { captcha, captchaKey } = request.body;
    const session = request.session;

    if (!captcha || !captchaKey) {
      throw new BadRequestException('请提供验证码');
    }

    if (!session?.captchas?.[captchaKey]) {
      throw new BadRequestException('验证码已过期或不存在');
    }

    const storedCaptcha = session.captchas[captchaKey];
    const now = Date.now();
    const expireTime = 5 * 60 * 1000; // 5分钟

    // 检查是否过期
    if (now - storedCaptcha.createdAt > expireTime) {
      delete session.captchas[captchaKey];
      throw new BadRequestException('验证码已过期');
    }

    // 验证验证码
    if (captcha.toLowerCase() !== storedCaptcha.text.toLowerCase()) {
      throw new BadRequestException('验证码错误');
    }

    // 验证成功后删除验证码（一次性使用）
    delete session.captchas[captchaKey];

    return true;
  }
}
