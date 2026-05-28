import { SetMetadata } from '@nestjs/common';

export const VERIFY_CAPTCHA_KEY = 'verifyCaptcha';
export const VerifyCaptcha = () => SetMetadata(VERIFY_CAPTCHA_KEY, true);
