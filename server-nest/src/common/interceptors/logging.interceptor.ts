import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  LOG_OPERATION_KEY,
  LogOperationOptions,
} from '../decorators/log-operation.decorator';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logOptions = this.reflector.get<LogOperationOptions>(
      LOG_OPERATION_KEY,
      context.getHandler(),
    );

    if (!logOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];

    const logData = {
      operator: user?.username || 'anonymous',
      operatorId: user?.userId || null,
      module: logOptions.module,
      action: logOptions.action,
      description: logOptions.description,
      platform: this.getPlatform(userAgent),
      operatorIP: ip,
      content: JSON.stringify({
        method: request.method,
        url: request.url,
        body: this.sanitizeBody(request.body),
        query: request.query,
      }),
    };

    return next.handle().pipe(
      tap({
        next: () => {
          // 这里可以调用日志服务保存日志
          // this.logService.create(logData);
          console.log('操作日志:', logData);
        },
        error: (error) => {
          // 记录错误日志
          console.error('操作失败:', { ...logData, error: error.message });
        },
      }),
    );
  }

  private getPlatform(userAgent: string): string {
    if (!userAgent) return 'unknown';
    if (userAgent.includes('Mobile')) return 'mobile';
    if (userAgent.includes('Tablet')) return 'tablet';
    return 'desktop';
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    // 移除敏感信息
    if (sanitized.password) sanitized.password = '***';
    if (sanitized.token) sanitized.token = '***';
    return sanitized;
  }
}
