# 项目架构与规范

## 📐 架构设计原则

### 1. 模块化设计
- 每个功能模块独立，职责单一
- 模块间通过接口通信，避免直接依赖
- 公共功能抽离到 `common` 目录

### 2. 分层架构
```
Controller (控制层) 
    ↓
Service (业务逻辑层)
    ↓
Repository/Model (数据访问层)
```

### 3. 依赖注入
- 使用 NestJS 的 DI 容器管理依赖
- 通过构造函数注入依赖
- 避免使用全局变量

## 📁 目录结构规范

```
src/
├── common/                      # 公共模块
│   ├── constants/              # 常量定义
│   │   ├── response.constants.ts
│   │   └── file.constants.ts
│   ├── decorators/             # 自定义装饰器
│   │   ├── current-user.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── api-paginated-response.decorator.ts
│   ├── dto/                    # 公共 DTO
│   │   ├── pagination.dto.ts
│   │   └── id-param.dto.ts
│   ├── enums/                  # 枚举定义
│   │   └── user.enum.ts
│   ├── filters/                # 全局过滤器
│   │   └── http-exception.filter.ts
│   ├── interceptors/           # 全局拦截器
│   │   └── transform.interceptor.ts
│   ├── interfaces/             # 接口定义
│   │   ├── response.interface.ts
│   │   └── user.interface.ts
│   ├── utils/                  # 工具类
│   │   ├── password.util.ts
│   │   ├── file.util.ts
│   │   └── response.util.ts
│   └── index.ts               # 统一导出
│
├── config/                     # 配置文件
│   ├── database.config.ts
│   └── jwt.config.ts
│
├── database/                   # 数据库模块
│   └── database.module.ts
│
├── modules/                    # 业务模块
│   ├── auth/                  # 认证模块
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/                 # 用户模块
│   │   ├── dto/
│   │   ├── schemas/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   └── upload/                # 文件上传模块
│       ├── config/
│       ├── upload.controller.ts
│       ├── upload.service.ts
│       └── upload.module.ts
│
├── app.module.ts              # 根模块
└── main.ts                    # 入口文件
```

## 🔧 模块设计规范

### 模块结构
每个业务模块应包含：
```
module-name/
├── dto/                       # 数据传输对象
│   ├── create-xxx.dto.ts
│   └── update-xxx.dto.ts
├── schemas/                   # 数据库模型
│   └── xxx.schema.ts
├── config/                    # 模块配置（可选）
│   └── xxx.config.ts
├── xxx.controller.ts          # 控制器
├── xxx.service.ts             # 服务
└── xxx.module.ts              # 模块定义
```

### 命名规范

#### 文件命名
- 使用 kebab-case：`user-profile.service.ts`
- 文件名应反映其用途：`*.controller.ts`, `*.service.ts`, `*.module.ts`

#### 类命名
- 使用 PascalCase：`UserProfileService`
- 类名应包含类型后缀：`Controller`, `Service`, `Module`

#### 变量/函数命名
- 使用 camelCase：`getUserProfile`
- 布尔值使用 is/has 前缀：`isActive`, `hasPermission`

## 🎯 代码规范

### 1. 依赖管理
```typescript
// ❌ 错误：直接依赖具体实现
import * as bcrypt from 'bcryptjs';

// ✅ 正确：使用工具类封装
import { PasswordUtil } from '@/common/utils/password.util';
```

### 2. 常量管理
```typescript
// ❌ 错误：硬编码
const maxFileSize = 10 * 1024 * 1024;

// ✅ 正确：使用常量
import { FILE_UPLOAD_CONFIG } from '@/common/constants/file.constants';
const maxFileSize = FILE_UPLOAD_CONFIG.MAX_FILE_SIZE;
```

### 3. 类型定义
```typescript
// ❌ 错误：使用 any
async login(loginDto: LoginDto): Promise<any> {
  // ...
}

// ✅ 正确：使用接口定义
import { LoginResponse } from '@/common/interfaces/user.interface';
async login(loginDto: LoginDto): Promise<LoginResponse> {
  // ...
}
```

### 4. 错误处理
```typescript
// ❌ 错误：字符串硬编码
throw new BadRequestException('请选择要上传的文件');

// ✅ 正确：使用常量
import { FILE_MESSAGES } from '@/common/constants/file.constants';
throw new BadRequestException(FILE_MESSAGES.NO_FILE);
```

### 5. 配置管理
```typescript
// ❌ 错误：配置分散在各处
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({ /* ... */ }),
  limits: { fileSize: 10 * 1024 * 1024 }
}))

// ✅ 正确：集中配置管理
import { multerConfig } from './config/multer.config';
@UseInterceptors(FileInterceptor('file', multerConfig))
```

## 🔒 模块解耦原则

### 1. 接口隔离
- 模块间通过接口通信
- 不直接依赖其他模块的实现细节

### 2. 依赖倒置
- 依赖抽象而非具体实现
- 使用 DI 容器管理依赖关系

### 3. 单一职责
- 每个模块只负责一个功能领域
- 避免模块功能过于复杂

### 4. 开闭原则
- 对扩展开放，对修改关闭
- 通过配置和策略模式实现灵活性

## 📝 最佳实践

### 1. DTO 验证
```typescript
export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6)
  password: string;
}
```

### 2. 使用装饰器
```typescript
// 获取当前用户
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: RequestUser) {
  return user;
}

// 公开接口
@Public()
@Post('login')
login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### 3. 统一响应格式
```typescript
// 通过全局拦截器自动处理
// Controller 直接返回数据
@Get()
findAll() {
  return this.usersService.findAll();
}

// 响应格式：
// {
//   "code": 200,
//   "message": "操作成功",
//   "data": [...]
// }
```

### 4. 分页查询
```typescript
@Get()
findAll(@Query() paginationDto: PaginationDto) {
  return this.usersService.findAll(paginationDto);
}
```

### 5. 参数验证
```typescript
@Get(':id')
findOne(@Param() params: IdParamDto) {
  return this.usersService.findOne(params.id);
}
```

## 🚀 性能优化

### 1. 数据库查询优化
- 使用索引
- 避免 N+1 查询
- 使用 lean() 查询纯对象

### 2. 缓存策略
- 使用 Redis 缓存热点数据
- 实现查询结果缓存

### 3. 异步处理
- 使用队列处理耗时任务
- 实现事件驱动架构

## 🔐 安全规范

### 1. 输入验证
- 所有输入必须验证
- 使用 class-validator

### 2. 密码安全
- 使用 bcrypt 加密
- 密码强度验证

### 3. JWT 安全
- Token 过期时间设置
- Refresh Token 机制

### 4. 文件上传安全
- 文件类型验证
- 文件大小限制
- 文件名安全处理

## 📊 监控与日志

### 1. 日志规范
- 使用统一的日志格式
- 记录关键操作
- 区分日志级别

### 2. 错误追踪
- 全局异常处理
- 错误堆栈记录
- 错误通知机制

## 🧪 测试规范

### 1. 单元测试
- Service 层必须测试
- 覆盖率 > 80%

### 2. E2E 测试
- 关键业务流程测试
- API 接口测试

### 3. 集成测试
- 模块间交互测试
- 数据库操作测试

---

**版本**: 1.0.0  
**更新时间**: 2026-05-28  
**维护者**: Development Team
