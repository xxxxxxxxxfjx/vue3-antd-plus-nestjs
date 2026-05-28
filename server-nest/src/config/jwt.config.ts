import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'gLR+JUuKR/R5KrA1gr4ukg==',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));
