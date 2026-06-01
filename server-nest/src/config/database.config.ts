import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const url = process.env.DB_URL || 'localhost';
  const port = parseInt(process.env.DB_PORT || '27017', 10);
  const name = process.env.DB_NAME || 'my_db';
  return {
    url,
    port,
    name,
    uri: `mongodb://${url}:${port}/${name}`,
  };
});
