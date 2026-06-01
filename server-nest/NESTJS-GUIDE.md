# NestJS 后端项目学习指南

> 基于本项目 `server-nest` 的实际代码，从零开始讲解 NestJS 的架构思想与模块设计。

---

## 一、为什么选 NestJS？

NestJS 是 Node.js 生态中最成熟的企业级后端框架。它的设计灵感来自 Angular（依赖注入、模块化、装饰器）和 Java Spring（AOP 切面编程），天生适合构建大型项目。

**核心理念**：把应用拆成可组合的「模块」，每个模块封装自己的 Controller / Service / Schema，模块间通过依赖注入（DI）解耦。

---

## 二、项目目录结构

```
server-nest/
├── .env.development          # 开发环境变量
├── .env.production           # 生产环境变量
├── package.json              # 依赖及脚本
├── tsconfig.json             # TypeScript 配置
├── nest-cli.json             # NestJS CLI 配置
├── uploads/                  # 静态文件目录
│
└── src/
    ├── main.ts               # 🚀 应用入口（启动引导）
    ├── app.module.ts         # 🏠 根模块（组装所有子模块）
    ├── app.controller.ts     # 根控制器
    ├── app.service.ts        # 根服务
    │
    ├── config/               # ⚙️  配置文件
    │   ├── database.config.ts
    │   └── jwt.config.ts
    │
    ├── database/             # 🗄️  数据库模块
    │   └── database.module.ts
    │
    ├── common/               # 🧰 公共层（一切可复用的东西）
    │   ├── constants/        # 常量定义
    │   ├── decorators/       # 自定义装饰器
    │   ├── dto/              # 通用 DTO
    │   ├── enums/            # 枚举
    │   ├── filters/          # 异常过滤器
    │   ├── guards/           # 守卫（权限校验）
    │   ├── interceptors/     # 拦截器（响应转换、日志）
    │   ├── interfaces/       # TypeScript 接口
    │   └── utils/            # 工具类
    │
    └── modules/              # 📦 业务模块（每个模块一个目录）
        ├── auth/             # 认证模块（登录/注册/JWT）
        ├── users/            # 用户模块
        ├── roles/            # 角色模块
        ├── permissions/      # 权限模块
        ├── captcha/          # 验证码模块
        ├── upload/           # 文件上传模块
        └── users-opt-logs/   # 操作日志模块
```

---

## 三、NestJS 核心概念

### 3.1 Module（模块）—— 组织代码的基本单位

模块是 NestJS 的「积木块」。每个模块通过 `@Module()` 装饰器定义它包含什么、依赖什么、导出什么。

```typescript
// src/modules/users/users.module.ts —— 典型的模块定义
@Module({
  imports: [
    // 注册 Mongoose 数据模型（告诉 NestJS 这个模块要操作哪些 MongoDB 集合）
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],  // 控制器（处理 HTTP 请求）
  providers: [UsersService],        // 提供者（业务逻辑）
  exports: [UsersService],          // 导出给其他模块使用
})
export class UsersModule {}
```

**`@Module()` 四个关键属性**：

| 属性 | 作用 | 比如 |
|------|------|------|
| `imports` | 导入依赖的其他模块 | 导入 `MongooseModule` 来连接数据库 |
| `controllers` | 注册控制器 | `UsersController` 处理 `/v1/sys/users/*` 请求 |
| `providers` | 注册可注入的服务 | `UsersService` 做真正的增删改查 |
| `exports` | 导出给其他模块用 | 导出 `UsersService` 让 `AuthModule` 能查询用户 |

根模块 `app.module.ts` 把所有这些子模块组装起来：

```typescript
// src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ... }),  // 全局配置模块
    DatabaseModule,     // 数据库连接
    UsersModule,        // 用户 CRUD
    RolesModule,        // 角色 CRUD
    AuthModule,         // 登录认证
    PermissionsModule,  // 权限管理
    UsersOptLogsModule, // 操作日志
    UploadModule,       // 文件上传
    CaptchaModule,      // 验证码
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

### 3.2 Controller（控制器）—— 处理 HTTP 请求

控制器负责接收请求、调用 Service、返回响应。**控制器只做路由分发，不做真正的业务逻辑**。

```typescript
// src/modules/users/users.controller.ts
@ApiTags('用户管理')                // Swagger 文档分组标签
@Controller('v1/sys/users')         // 路由前缀
export class UsersController {
  constructor(
    private readonly usersService: UsersService,  // 通过 DI 注入 Service
  ) {}

  @Post('list')                      // POST /v1/sys/users/list
  @ApiOperation({ summary: '获取用户列表' })
  async usersList(@Body() query?: Record<string, any>) {
    return this.usersService.findAll(query);   // 委托给 Service 处理
  }
}
```

**路由装饰器一览**：

| 装饰器 | 用途 | 示例 |
|--------|------|------|
| `@Get('path')` | GET 请求 | `@Get(':id')` |
| `@Post('path')` | POST 请求 | `@Post('create')` |
| `@Patch('path')` | PATCH 请求 | `@Patch(':id')` |
| `@Delete('path')` | DELETE 请求 | `@Delete(':id')` |

**参数装饰器**：

| 装饰器 | 获取内容 |
|--------|----------|
| `@Body()` | 请求体 |
| `@Param('id')` | 路由参数 |
| `@Query()` | URL 查询参数 |
| `@Request()` | 完整的 Express Request 对象 |
| `@Session()` | Session 对象 |

---

### 3.3 Service（服务）—— 真正的业务逻辑

Service 通过 `@Injectable()` 声明，表示可以被注入到任何地方。它操作数据库、处理复杂逻辑。

```typescript
// src/modules/users/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    // ↑ 通过 @InjectModel 注入 Mongoose 模型
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');  // NestJS 内置异常
    }
    const hashedPassword = await PasswordUtil.hash(createUserDto.password);
    const createdUser = new this.userModel({ ...createUserDto, password: hashedPassword });
    return createdUser.save();
  }

  async findAll(query?: Record<string, any>): Promise<any> {
    // 使用 MongoDB Aggregation Pipeline 实现分页、模糊搜索、关联查询
    const aggregationPipeline = [
      { $match: fuzzyParams },
      {
        $lookup: {                      // MongoDB 连表查询
          from: 'roles',                // 关联 roles 表
          localField: 'roleId',         // User.roleId
          foreignField: '_id',          // Role._id
          as: 'role',                   // 结果存入 role 字段
        },
      },
      { $sort: { [sortColumn]: sortOrder } },
      { $skip: (current - 1) * pageSize },
      { $limit: pageSize },
    ];
    const [result, total] = await Promise.all([
      this.userModel.aggregate(aggregationPipeline).exec(),
      this.userModel.countDocuments(params).exec(),
    ]);
    return { result, current, pageSize, total };
  }
}
```

---

### 3.4 Schema（数据模型）—— 定义 MongoDB 文档结构

使用 `@Schema()` 和 `@Prop()` 装饰器定义 MongoDB 集合的字段。

```typescript
// src/modules/users/schemas/user.schema.ts
@Schema({ timestamps: true, versionKey: false })
//        ↑ 自动添加 createdAt/updatedAt    ↑ 去掉 __v 字段
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Role' })
  roleId: Types.ObjectId;          // 关联 Role 表的外键

  @Prop({ required: true, default: true })
  status: boolean;                 // 用户启用/禁用
}

export const UserSchema = SchemaFactory.createForClass(User);
```

权限模块的 Schema 还演示了如何添加 **静态方法**（static method），用来把扁平数据转成树形结构：

```typescript
// src/modules/permissions/schemas/permission.schema.ts
PermissionSchema.statics.toTree = function (permissions: any[]) {
  const tree = [];
  const map = {};
  permissions.forEach((p) => (map[p.key] = { ...p }));
  permissions.forEach((p) => {
    const parent = map[p.parent_key];
    if (parent) {
      (parent.children ||= []).push(map[p.key]);
    } else {
      tree.push(map[p.key]);
    }
  });
  return tree;
};
```

---

### 3.5 DTO（数据传输对象）—— 校验请求参数

DTO 配合 `class-validator` 和 `class-transformer` 库，在请求进入 Controller 之前自动校验。

```typescript
// src/modules/auth/dto/login.dto.ts
export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '密码', example: 'admin123' })
  @IsString()
  @MinLength(3, { message: '密码长度不能少于3位' })
  password: string;
}
```

`UpdateUserDto` 用 `PartialType` 让所有字段变成可选：

```typescript
// src/modules/users/dto/update-user.dto.ts
export class UpdateUserDto extends PartialType(CreateUserDto) {}
// PartialType 是 @nestjs/swagger 提供的工具，自动将所有字段标记为可选
```

---

## 四、公共层（common/）—— 一次定义，到处复用

公共层是 NestJS「AOP 切面编程」思想的核心体现。这些组件不写业务逻辑，而是在请求链路的**横切面**上施加影响。

```
请求 → Guard(权限检查) → Interceptor(前置) → Controller → Interceptor(后置) → Filter(异常捕获)
```

### 4.1 Filter（异常过滤器）

**作用**：统一捕获所有未处理的异常，格式化成一致的响应。

```typescript
// src/common/filters/http-exception.filter.ts
@Catch()  // 不传参数 = 捕获所有异常
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 把异常信息统一成 { status: 0, message: '...', time: ... } 格式
    response.status(status).json({
      status: 0,
      message: Array.isArray(message) ? message[0] : message,
      time: Date.now(),
    });
  }
}
```

在 `main.ts` 中全局注册：

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

### 4.2 Interceptor（拦截器）

**作用**：在请求前后插入逻辑，比如统一包装响应格式。

`TransformInterceptor` 把所有成功响应包装成 `{ status: 1, message: '...', data: ..., time: ... }`：

```typescript
// src/common/interceptors/transform.interceptor.ts
return next.handle().pipe(
  map((data) => ({
    status: 1,
    message: '操作成功',
    data,
    time: Date.now(),
  })),
);
```

`LoggingInterceptor` 自动记录操作日志（通过 `@LogOperation()` 装饰器标记的方法才会被记录）：

```typescript
// 从装饰器的元数据中读取日志配置
const logOptions = this.reflector.get(LOG_OPERATION_KEY, context.getHandler());
// 记录操作人、IP、模块、动作、请求内容...
```

### 4.3 Guard（守卫）

**作用**：在请求到达 Controller 之前做权限校验，返回 `true` 放行，`false` 拒绝。

```typescript
// src/common/guards/roles.guard.ts —— 角色守卫
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. 通过 Reflector 读取 @Roles() 装饰器设置的元数据
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [...]);

    // 2. 没设置 @Roles() = 不需要角色校验，直接放行
    if (!requiredRoles) return true;

    // 3. 检查当前用户的 role 是否在允许列表中
    return requiredRoles.some((role) => user.role === role);
  }
}
```

```typescript
// src/common/guards/permissions.guard.ts —— 权限守卫
// 逻辑类似，但用 .every() 要求用户拥有所有必需权限
return requiredPermissions.every((p) => user.permissions.includes(p));
```

```typescript
// src/common/guards/captcha.guard.ts —— 验证码守卫
// 从 Session 中读取验证码，比对用户输入，过期时间 5 分钟
```

### 4.4 Decorator（装饰器）—— 声明式的元数据标记

NestJS 的装饰器本质是给方法/类打上「元数据标签」，Guards 和 Interceptors 通过 `Reflector` 读取这些标签来决策。

| 装饰器 | 作用 | 使用方式 |
|--------|------|----------|
| `@Public()` | 标记接口不需要 JWT 认证 | `@Public()` 在方法上标注 |
| `@Roles('admin')` | 标记需要的角色 | `@Roles('admin', 'manager')` |
| `@RequirePermissions('user:create')` | 标记需要的权限 | `@RequirePermissions('user:delete')` |
| `@VerifyCaptcha()` | 标记需要验证码校验 | `@VerifyCaptcha()` |
| `@LogOperation({ module, action })` | 标记需要记录操作日志 | `@LogOperation({ module: '用户管理', action: '创建用户' })` |
| `@CurrentUser()` | 从 JWT 中提取当前用户 | `@CurrentUser() user: RequestUser` |

**实现原理**——以 `@Roles()` 为例：

```typescript
// 第一步：定义装饰器（本质是调用 SetMetadata 写入元数据）
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// 第二步：在 Controller 中使用
@Roles('admin')   // 等效于 SetMetadata('roles', ['admin'])
async someMethod() { ... }

// 第三步：Guard 中通过 Reflector 读取元数据
const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [handler, class]);
```

**`@CurrentUser()` 是 `createParamDecorator`**，它从 `request.user`（JWT 解析后挂载的）中提取用户信息：

```typescript
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  },
);
```

---

## 五、各业务模块详解

### 5.1 Auth 模块（认证）

**文件**：`src/modules/auth/`

**核心流程**：

```
POST /v1/sys/auth/login
  → AuthController.login()
    → 校验 Session 验证码
    → AuthService.login()
      → UsersService.findByUsername() 查用户
      → UsersService.validatePassword() 验密码（bcrypt）
      → JwtService.sign() 签发 JWT Token
    → 返回 { token, username, nickname, ... }
```

**JWT 认证流程**：

```
1. 用户登录 → 服务端签发 Token
2. 用户请求携带 Authorization: Bearer <token>
3. JwtStrategy.validate() → 从 Token 解析出 userId
4. 查询数据库确认用户存在 → 挂载到 request.user
5. JwtAuthGuard 放行请求
```

`JwtStrategy`（Passport 策略）负责解析 Token：

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException('用户不存在');
    return { userId: payload.sub, username: payload.username };
    // ↑ 这个返回值会被挂载到 request.user
  }
}
```

### 5.2 Users 模块（用户）

**文件**：`src/modules/users/`

**接口**：`POST /v1/sys/users/*`（list / create / update / delete / findOne / reset）

**关键点**：
- 密码用 bcrypt 加盐哈希存储（`PasswordUtil`）
- 列表查询用 MongoDB Aggregation Pipeline，连表查角色信息（`$lookup`）
- 删除时保护 admin 用户不被删除
- `update` 时如果传了新密码，自动重新哈希

**增强版控制器**（`users-enhanced.controller.ts`）展示了 NestJS 的最佳实践：

```typescript
@Controller('v1/users-enhanced')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)  // 全局守卫
@UseInterceptors(LoggingInterceptor)                      // 全局拦截器
@ApiBearerAuth()                                          // Swagger Bearer 认证
export class UsersEnhancedController {
  @Post()
  @Roles('admin', 'manager')                  // 角色要求
  @RequirePermissions('user:create')          // 权限要求
  @LogOperation({ module: '用户管理', action: '创建用户' })
  create(@Body() dto: CreateUserDto, @CurrentUser() user: RequestUser) {
    // @CurrentUser() 直接从 JWT 提取当前用户，无需手动 req.user
  }

  @Get('export')
  @Roles('admin')
  @RequirePermissions('user:export')
  async exportUsers(@Res() res: Response) {
    // 导出 Excel（使用 ExcelUtil）
  }
}
```

### 5.3 Roles 模块（角色）

**文件**：`src/modules/roles/`

**Schema 关键字段**：

| 字段 | 说明 |
|------|------|
| `roleName` | 角色名称，如「管理员」 |
| `roleAuth` | 角色标识，如 `SUPER-ADMIN`、`VISITOR-ADMIN` |
| `perms` | 拥有的权限 key 数组，如 `['user:list', 'user:create']` |
| `status` | 启用/禁用 |

**保护的不可操作角色**：`SUPER-ADMIN`（不能改、不能删）、`VISITOR-ADMIN`（不能删）。

### 5.4 Permissions 模块（权限）

**文件**：`src/modules/permissions/`

**权限树的设计**：通过 `key` 和 `parent_key` 两个字段实现无限层级树。

```
{ key: 'user', parent_key: null }          ← 一级：用户管理
  ├─ { key: 'user:list', parent_key: 'user' }    ← 二级：查询
  ├─ { key: 'user:create', parent_key: 'user' }  ← 二级：新增
  └─ { key: 'user:delete', parent_key: 'user' }  ← 二级：删除
```

创建权限时如果 key 含一个冒号且 `autoSon=true`，自动生成 CRUD 四子权限：

```typescript
if (colonCount === 1 && autoSon) {
  await this.permissionModel.insertMany([
    { name: '查询', key: dto.key + ':list', ... },
    { name: '增加', key: dto.key + ':create', ... },
    { name: '删除', key: dto.key + ':delete', ... },
    { name: '更新', key: dto.key + ':update', ... },
  ]);
}
```

### 5.5 Captcha 模块（验证码）

**文件**：`src/modules/captcha/`

使用 `svg-captcha` 库生成数学表达式验证码（如「3+5=?」），答案存入 Session，前端展示 SVG 图片。

```
GET /v1/sys/auth/captcha
  → 生成数学题 SVG
  → session.code = 答案
  → 返回 SVG 图片
```

### 5.6 Upload 模块（文件上传）

**文件**：`src/modules/upload/`

使用 `multer` 中间件处理文件上传。`multer.config.ts` 配置了磁盘存储策略和文件大小限制（10MB）。

上传后返回文件 URL，通过 `/uploads/` 路径静态访问。

### 5.7 UsersOptLogs 模块（操作日志）

**文件**：`src/modules/users-opt-logs/`

记录用户的每个操作（操作人、IP、平台、模块、动作、内容）。支持导出/导入 Excel。

---

## 六、应用入口（main.ts）—— 启动引导全解析

```typescript
// src/main.ts
async function bootstrap() {
  // 1. 创建应用实例（Express 平台）
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. 配置 Session 中间件
  app.use(session({ secret: '...', cookie: { maxAge: 30分钟 } }));

  // 3. 配置静态文件服务（让上传的文件可通过 URL 访问）
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

  // 4. 开启 CORS（跨域）
  app.enableCors({ origin: true, credentials: true });

  // 5. 全局注册异常过滤器（统一错误格式）
  app.useGlobalFilters(new HttpExceptionFilter());

  // 6. 全局注册拦截器（统一成功响应格式）
  app.useGlobalInterceptors(new TransformInterceptor());

  // 7. 全局管道（自动校验 DTO）
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // 自动剔除 DTO 未定义的字段
    transform: true,           // 自动类型转换
    forbidNonWhitelisted: true,// 有未定义字段时直接报错
  }));

  // 8. Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('ZY3-API 接口文档')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);  // 文档地址: /swagger

  // 9. 启动监听
  await app.listen(3089);
}
bootstrap();
```

---

## 七、请求生命周期（一次请求走了哪些路）

以一个带权限校验的请求为例 —— `POST /v1/users-enhanced`：

```
1. 请求进入
     ↓
2. ValidationPipe
   → 校验 Body 是否符合 CreateUserDto 的定义
   → 自动剔除 DTO 未定义的字段 (whitelist: true)
     ↓
3. JwtAuthGuard
   → 从 Authorization Header 提取 Bearer Token
   → JwtStrategy.validate() 解析 Token
   → 查询数据库确认用户存在
   → request.user = { userId, username }
     ↓
4. RolesGuard
   → 读取 @Roles('admin', 'manager') 元数据
   → 检查 request.user.role 是否在 ['admin', 'manager'] 中
   → 不在 → 403 Forbidden
     ↓
5. PermissionsGuard
   → 读取 @RequirePermissions('user:create') 元数据
   → 检查 request.user.permissions 是否包含 'user:create'
   → 不包含 → 403 Forbidden
     ↓
6. LoggingInterceptor（前置）
   → 读取 @LogOperation(...) 元数据，准备日志数据
     ↓
7. Controller
   → usersEnhancedController.create(dto, user)
     ↓
8. Service
   → usersService.create(dto)
   → bcrypt 哈希密码 → new this.userModel(...).save()
     ↓
9. LoggingInterceptor（后置）
   → 打印操作日志
     ↓
10. TransformInterceptor
   → 包装返回值: { status: 1, message: '操作成功', data: {...}, time: ... }
     ↓
11. 响应返回客户端
```

---

## 八、技术栈速查

| 类别 | 库 | 用途 |
|------|-----|------|
| **框架核心** | `@nestjs/core`, `@nestjs/common` | 模块/控制器/依赖注入 |
| **HTTP 平台** | `@nestjs/platform-express` | 基于 Express 的 HTTP 服务 |
| **数据库** | `@nestjs/mongoose`, `mongoose` | MongoDB ODM |
| **认证** | `@nestjs/jwt`, `passport`, `passport-jwt` | JWT 认证 |
| **校验** | `class-validator`, `class-transformer` | DTO 参数校验 |
| **配置** | `@nestjs/config` | 环境变量管理 |
| **文档** | `@nestjs/swagger` | 自动生成 Swagger 接口文档 |
| **限流** | `@nestjs/throttler` | API 请求限流 |
| **加密** | `bcryptjs` | 密码哈希（10 轮加盐） |
| **验证码** | `svg-captcha` | SVG 图形/数学验证码 |
| **文件上传** | `multer` | multipart/form-data 处理 |
| **Excel** | `exceljs` | Excel 导入导出 |

---

## 九、学习路线建议

1. **先跑起来**：`npm run start:dev` → 访问 `http://localhost:3089/swagger` 看接口文档
2. **看请求链路**：选一个简单接口（如 `GET /captcha`），从 Controller → Service 跟踪代码
3. **理解依赖注入**：看 `AuthService` 如何注入 `UsersService` + `JwtService`
4. **理解装饰器模式**：从 `@Roles()` → `RolesGuard` → `Reflector` 走通元数据读写
5. **理解模块组装**：看 `app.module.ts` 如何把 9 个模块拼在一起
6. **动手加功能**：试着新增一个 `Department` 模块，模仿 Users 模块的结构
