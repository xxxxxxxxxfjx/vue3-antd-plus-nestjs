import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DB_URL || 'localhost',
  port: parseInt(process.env.DB_PORT || '27017', 10),
  name: process.env.DB_NAME || 'my_db',
  get uri() {
    return `mongodb://${this.url}:${this.port}/${this.name}`;
  },
}));
