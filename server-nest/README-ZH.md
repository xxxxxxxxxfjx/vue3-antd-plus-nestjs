# SERVER-NEST

基于 NestJS 框架重构的后端服务，使用 TypeScript、MongoDB 和 Mongoose。

## 技术栈

- **框架**: NestJS 10.x
- **语言**: TypeScript
- **数据库**: MongoDB + Mongoose
- **认证**: JWT (JSON Web Token)
- **文档**: Swagger/OpenAPI
- **验证**: class-validator + class-transformer

## 项目结构

```
server-nest/
├── src/
│   ├── common/                 # 公共模块
│   │   ├── filters/           # 全局异常过滤器
│   │   └── interceptors/      # 全局拦截器
│   ├── config/                # 配置文件
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── modules/               # 业务模块
│   │   ├── auth/             # 认证模块
│   │   ├── users/            # 用户模块
│   │   ├── roles/            # 角色模块
│   │   ├── permissions/      # 权限模块
│   │   ├── users-opt-logs/   # 操作日志模块
│   │   └── upload/           # 文件上传模块
│   ├── app.module.ts         # 根模块
│   └── main.ts               # 入口文件
├── uploads/                   # 上传文件目录
├── .env.development          # 开发环境变量
├── .env.production           # 生产环境变量
└── package.json
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.development` 文件并根据需要修改配置：

```env
NODE_ENV=development
PORT=3089
DB_URL=localhost
DB_PORT=27017
DB_NAME=my_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 启动项目

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

### 访问接口文档

启动项目后，访问 Swagger 文档：

```
http://localhost:3089/swagger
```

## 核心功能模块

### 1. 认证模块 (Auth)

- **POST** `/v1/auth/login` - 用户登录
- **GET** `/v1/auth/profile` - 获取当前用户信息（需要认证）

### 2. 用户模块 (Users)

- **POST** `/v1/users` - 创建用户
- **GET** `/v1/users` - 获取用户列表
- **GET** `/v1/users/:id` - 获取用户详情
- **PATCH** `/v1/users/:id` - 更新用户信息
- **DELETE** `/v1/users/:id` - 删除用户

### 3. 角色模块 (Roles)

- **POST** `/v1/roles` - 创建角色
- **GET** `/v1/roles` - 获取角色列表
- **GET** `/v1/roles/:id` - 获取角色详情
- **PATCH** `/v1/roles/:id` - 更新角色信息
- **DELETE** `/v1/roles/:id` - 删除角色

### 4. 权限模块 (Permissions)

- **POST** `/v1/permissions` - 创建权限
- **GET** `/v1/permissions` - 获取权限列表
- **GET** `/v1/permissions/tree` - 获取权限树形结构
- **GET** `/v1/permissions/:id` - 获取权限详情
- **PATCH** `/v1/permissions/:id` - 更新权限信息
- **DELETE** `/v1/permissions/:id` - 删除权限

### 5. 操作日志模块 (UsersOptLogs)

- **POST** `/v1/users-opt-logs` - 创建操作日志
- **GET** `/v1/users-opt-logs` - 获取操作日志列表
- **GET** `/v1/users-opt-logs/:id` - 获取日志详情
- **DELETE** `/v1/users-opt-logs/:id` - 删除日志

### 6. 文件上传模块 (Upload)

- **POST** `/v1/upload/single` - 上传单个文件
- **POST** `/v1/upload/multiple` - 上传多个文件

## API 响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "错误信息",
  "data": null,
  "timestamp": "2026-05-28T07:00:00.000Z"
}
```

## 认证说明

使用 JWT Bearer Token 进行认证：

```bash
# 1. 登录获取 token
POST /v1/auth/login
{
  "username": "admin",
  "password": "123456"
}

# 2. 在请求头中携带 token
Authorization: Bearer <your-token>
```

## 开发命令

```bash
# 开发模式
npm run start:dev

# 调试模式
npm run start:debug

# 生产构建
npm run build

# 生产运行
npm run start:prod

# 代码格式化
npm run format

# 代码检查
npm run lint

# 运行测试
npm run test
```

## 与原 Express 项目对比

| 特性 | Express (原项目) | NestJS (新项目) |
|------|-----------------|----------------|
| 架构 | 传统 MVC | 模块化、依赖注入 |
| TypeScript | 部分支持 | 完全支持 |
| 代码组织 | 手动管理 | CLI 自动生成 |
| 依赖注入 | 无 | 内置 DI 容器 |
| 装饰器 | 手动实现 | 原生支持 |
| 测试 | 需手动配置 | 内置测试框架 |
| 文档 | express-swagger-generator | @nestjs/swagger |
| 验证 | express-validator | class-validator |

## 注意事项

1. 确保 MongoDB 服务已启动
2. 修改 `.env` 文件中的数据库连接信息
3. JWT_SECRET 在生产环境中应使用强密钥
4. 建议使用 PM2 或 Docker 部署生产环境

## License

MIT
