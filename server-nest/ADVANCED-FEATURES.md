# 高级功能使用指南

## 📋 目录

1. [操作日志自动记录](#1-操作日志自动记录)
2. [分页查询](#2-分页查询)
3. [RBAC 权限控制](#3-rbac-权限控制)
4. [请求限流](#4-请求限流)
5. [数据导出（Excel）](#5-数据导出excel)

---

## 1. 操作日志自动记录

### 功能说明
自动记录用户的操作行为，包括操作人、操作模块、操作内容、IP地址等信息。

### 使用方法

#### 1.1 在 Controller 中使用装饰器

```typescript
import { LogOperation } from '@/common';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';

@Controller('v1/users')
@UseInterceptors(LoggingInterceptor)  // 启用日志拦截器
export class UsersController {
  
  @Post()
  @LogOperation({ 
    module: '用户管理', 
    action: '创建用户',
    description: '创建新用户账号'
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  
  @Delete(':id')
  @LogOperation({ 
    module: '用户管理', 
    action: '删除用户' 
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

#### 1.2 日志数据结构

```typescript
{
  operator: 'admin',           // 操作人用户名
  operatorId: '507f1f77...',   // 操作人ID
  module: '用户管理',          // 操作模块
  action: '创建用户',          // 操作动作
  description: '...',          // 操作描述
  platform: 'desktop',         // 操作平台
  operatorIP: '192.168.1.1',   // 操作IP
  content: '{...}',            // 操作内容（JSON）
  createdAt: '2026-05-28...'   // 操作时间
}
```

#### 1.3 集成到日志服务

```typescript
// logging.interceptor.ts
return next.handle().pipe(
  tap({
    next: () => {
      // 调用日志服务保存
      this.usersOptLogsService.create(logData);
    },
  }),
);
```

---

## 2. 分页查询

### 功能说明
统一的分页查询参数和响应格式。

### 使用方法

#### 2.1 创建查询 DTO

```typescript
import { PaginationDto } from '@/common';

export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional({ description: '用户名搜索' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '状态筛选' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
```

#### 2.2 在 Controller 中使用

```typescript
import { ApiPaginatedResponse } from '@/common';

@Get()
@ApiPaginatedResponse(User)  // Swagger 文档
async findAll(@Query() queryDto: QueryUserDto) {
  return this.usersService.findAllPaginated(queryDto);
}
```

#### 2.3 在 Service 中实现

```typescript
import { PaginationUtil } from '@/common';

async findAllPaginated(queryDto: QueryUserDto) {
  const { page = 1, limit = 10, sortBy, sortOrder } = queryDto;
  
  // 构建查询条件
  const filter: any = {};
  if (queryDto.username) {
    filter.username = new RegExp(queryDto.username, 'i');
  }
  if (queryDto.status !== undefined) {
    filter.status = queryDto.status;
  }

  // 查询总数
  const total = await this.userModel.countDocuments(filter);
  
  // 分页查询
  const skip = PaginationUtil.getSkip(page, limit);
  const sort = PaginationUtil.buildSort(sortBy, sortOrder);
  
  const items = await this.userModel
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .exec();

  return PaginationUtil.paginate(items, total, queryDto);
}
```

#### 2.4 响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## 3. RBAC 权限控制

### 功能说明
基于角色和权限的访问控制。

### 使用方法

#### 3.1 角色控制

```typescript
import { Roles } from '@/common';
import { RolesGuard } from '@/common/guards/roles.guard';

@Controller('v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  
  @Post()
  @Roles('admin', 'manager')  // 只有 admin 和 manager 可以访问
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  
  @Delete(':id')
  @Roles('admin')  // 只有 admin 可以删除
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

#### 3.2 权限控制

```typescript
import { RequirePermissions } from '@/common';
import { PermissionsGuard } from '@/common/guards/permissions.guard';

@Controller('v1/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  
  @Post()
  @RequirePermissions('user:create')  // 需要创建用户权限
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  
  @Get('export')
  @RequirePermissions('user:export')  // 需要导出权限
  exportUsers(@Res() res: Response) {
    // ...
  }
}
```

#### 3.3 组合使用

```typescript
@Controller('v1/users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class UsersController {
  
  @Delete(':id')
  @Roles('admin')                    // 必须是管理员
  @RequirePermissions('user:delete') // 且有删除权限
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

#### 3.4 用户对象结构

```typescript
// JWT Strategy 中设置
async validate(payload: JwtPayload) {
  const user = await this.usersService.findOne(payload.sub);
  
  return {
    userId: user._id,
    username: user.username,
    role: user.roleId?.roleAuth,        // 角色标识
    permissions: user.roleId?.perms,    // 权限列表
  };
}
```

---

## 4. 请求限流

### 功能说明
防止接口被恶意调用，限制请求频率。

### 安装依赖

```bash
npm install @nestjs/throttler
```

### 使用方法

#### 4.1 全局配置

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 时间窗口（毫秒）
      limit: 10,   // 限制次数
    }]),
    // ...
  ],
})
export class AppModule {}
```

#### 4.2 应用到 Controller

```typescript
import { Throttle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from '@/common';

@Controller('v1/auth')
@UseGuards(CustomThrottlerGuard)
export class AuthController {
  
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })  // 1分钟内最多5次
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

#### 4.3 自定义限流策略

```typescript
// custom-throttler.guard.ts
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // 根据用户ID限流（已登录用户）
    if (req.user?.userId) {
      return `user:${req.user.userId}`;
    }
    // 根据IP限流（未登录用户）
    return req.ip;
  }
}
```

---

## 5. 数据导出（Excel）

### 功能说明
将数据导出为 Excel 文件，支持自定义列和样式。

### 安装依赖

```bash
npm install exceljs
```

### 使用方法

#### 5.1 导出数据

```typescript
import { ExcelUtil, ExcelColumn } from '@/common';

@Controller('v1/users')
export class UsersController {
  
  @Get('export')
  async exportUsers(@Res() res: Response, @Query() queryDto: QueryUserDto) {
    // 获取数据
    const users = await this.usersService.findAll(queryDto);

    // 定义列
    const columns: ExcelColumn[] = [
      { header: '用户名', key: 'username', width: 20 },
      { header: '昵称', key: 'nickname', width: 20 },
      { header: '邮箱', key: 'email', width: 30 },
      { header: '状态', key: 'status', width: 10 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ];

    // 格式化数据
    const data = users.map((user: any) => ({
      username: user.username,
      nickname: user.nickname,
      email: user.email || '-',
      status: user.status ? '正常' : '禁用',
      createdAt: new Date(user.createdAt).toLocaleString('zh-CN'),
    }));

    // 导出
    await ExcelUtil.exportToExcel(data, columns, '用户列表', res);
  }
}
```

#### 5.2 下载导入模板

```typescript
@Get('template')
async downloadTemplate(@Res() res: Response) {
  const columns: ExcelColumn[] = [
    { header: '用户名*', key: 'username', width: 20 },
    { header: '昵称*', key: 'nickname', width: 20 },
    { header: '密码*', key: 'password', width: 20 },
    { header: '邮箱', key: 'email', width: 30 },
    { header: '备注', key: 'remark', width: 30 },
  ];

  await ExcelUtil.createTemplate(columns, '用户导入', res);
}
```

#### 5.3 Swagger 文档配置

```typescript
@Get('export')
@ApiOperation({ summary: '导出用户数据为 Excel' })
@ApiResponse({ 
  status: 200, 
  description: '导出成功',
  content: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {}
  }
})
async exportUsers(@Res() res: Response) {
  // ...
}
```

---

## 6. 综合示例

### 完整的 Controller 示例

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  LogOperation,
  Roles,
  RequirePermissions,
  CurrentUser,
  ApiPaginatedResponse,
} from '@/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { CustomThrottlerGuard } from '@/common/guards/custom-throttler.guard';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { RequestUser } from '@/common/interfaces/user.interface';

@ApiTags('用户管理（增强版）')
@Controller('v1/users-enhanced')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, CustomThrottlerGuard)
@UseInterceptors(LoggingInterceptor)
@ApiBearerAuth()
export class UsersEnhancedController {
  
  @Post()
  @Roles('admin', 'manager')
  @RequirePermissions('user:create')
  @LogOperation({ module: '用户管理', action: '创建用户' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: RequestUser) {
    console.log('当前操作用户:', user);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiPaginatedResponse(User)
  findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAllPaginated(queryDto);
  }

  @Get('export')
  @Roles('admin')
  @RequirePermissions('user:export')
  @LogOperation({ module: '用户管理', action: '导出数据' })
  async exportUsers(@Res() res: Response, @Query() queryDto: QueryUserDto) {
    // 导出逻辑
  }

  @Delete(':id')
  @Roles('admin')
  @RequirePermissions('user:delete')
  @LogOperation({ module: '用户管理', action: '删除用户' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

---

## 7. 最佳实践

### 7.1 装饰器顺序

推荐的装饰器顺序（从上到下）：

1. Swagger 相关装饰器 (`@ApiOperation`, `@ApiResponse` 等)
2. HTTP 方法装饰器 (`@Get`, `@Post` 等)
3. 限流装饰器 (`@Throttle`)
4. 权限装饰器 (`@Roles`, `@RequirePermissions`)
5. 日志装饰器 (`@LogOperation`)

### 7.2 守卫顺序

推荐的守卫顺序：

1. `JwtAuthGuard` - 身份认证
2. `RolesGuard` - 角色验证
3. `PermissionsGuard` - 权限验证
4. `CustomThrottlerGuard` - 限流控制

### 7.3 性能优化

- 分页查询时使用索引
- 导出大量数据时考虑异步处理
- 限流配置要合理，避免影响正常用户

### 7.4 安全建议

- 敏感操作必须加权限控制
- 导出功能要限制数据量
- 日志记录要过滤敏感信息（密码、Token等）

---

**版本**: 1.0.0  
**更新时间**: 2026-05-28
