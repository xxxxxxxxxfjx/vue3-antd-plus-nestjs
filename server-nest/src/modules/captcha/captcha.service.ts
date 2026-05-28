import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';

@Injectable()
export class CaptchaService {
  /**
   * 生成图形验证码
   */
  generateCaptcha(options?: {
    size?: number;
    noise?: number;
    color?: boolean;
    background?: string;
  }) {
    const captcha = svgCaptcha.create({
      size: options?.size || 4, // 验证码长度
      noise: options?.noise || 2, // 干扰线条数
      color: options?.color || true, // 验证码字符是否有颜色
      background: options?.background || '#f0f0f0', // 背景颜色
      width: 100,
      height: 40,
      fontSize: 50,
      charPreset: '1234567890', // 只使用数字
    });

    return {
      text: captcha.text, // 验证码文本
      data: captcha.data, // SVG 图片
    };
  }

  /**
   * 生成数学表达式验证码
   */
  generateMathCaptcha(options?: {
    noise?: number;
    color?: boolean;
    background?: string;
    width?: number;
    height?: number;
    fontSize?: number;
  }) {
    const captcha = svgCaptcha.createMathExpr({
      noise: options?.noise ?? 2,
      color: options?.color ?? true,
      background: options?.background ?? '#f0f0f0',
      width: options?.width ?? 100,
      height: options?.height ?? 40,
      fontSize: options?.fontSize ?? 40,
    });

    return {
      text: captcha.text, // 数学表达式的答案
      data: captcha.data, // SVG 图片
    };
  }

  /**
   * 验证验证码
   */
  verifyCaptcha(userInput: string, correctAnswer: string): boolean {
    if (!userInput || !correctAnswer) {
      return false;
    }
    // 不区分大小写
    return userInput.toLowerCase() === correctAnswer.toLowerCase();
  }
}
