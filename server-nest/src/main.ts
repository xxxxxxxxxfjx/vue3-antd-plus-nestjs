import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import session = require('express-session');
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  // 在应用启动前打印
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('加载的 env 文件:', `.env.${process.env.NODE_ENV || 'development'}`);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 配置 Session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-session-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 30, // 30分钟
        httpOnly: true,
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: true,
    credentials: true, // 允许携带 cookie
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ZY3-API 接口文档')
    .setDescription('基于 NestJS 的后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('认证管理')
    .addTag('用户管理')
    .addTag('角色管理')
    .addTag('权限管理')
    .addTag('操作日志')
    .addTag('文件上传')
    .addTag('验证码')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT || 3090;
  await app.listen(port);

  console.log(`\n项目启动成功: http://localhost:${port}/v1`);
  console.log(`接口文档地址: http://localhost:${port}/swagger\n`);
}
bootstrap();
