# 快速启动指南

## 📋 前置要求

- Node.js >= 18.0.0
- MongoDB >= 4.4
- npm 或 yarn

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server-nest
npm install
```

### 2. 配置环境变量

创建 `.env.development` 文件：

```env
# 服务端口
PORT=3090

# 数据库配置
DB_URL=localhost
DB_PORT=27017
DB_NAME=vue3_antd_plus

# JWT 配置
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

创建 `.env.production` 文件：

```env
# 服务端口
PORT=3089

# 数据库配置
DB_URL=your-production-db-host
DB_PORT=27017
DB_NAME=vue3_antd_plus_prod

# JWT 配置
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d
```

### 3. 启动 MongoDB

确保 MongoDB 服务已启动：

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# 或
brew services start mongodb-community
```

### 4. 启动项目

**开发模式**（热重载）：
```bash
npm run start:dev
```

**生产模式**：
```bash
# 先构建
npm run build

# 启动
npm run start:prod
```

### 5. 访问应用

- **API 文档**: http://localhost:3090/swagger
- **API 接口**: http://localhost:3090/v1

## 📝 初始化数据

### 创建管理员账号

使用 Swagger 或 Postman 调用以下接口：

**1. 创建角色**

```http
POST http://localhost:3090/v1/roles
Content-Type: application/json

{
  "roleName": "管理员",
  "roleAuth": "admin",
  "perms": ["user:create", "user:update", "user:delete", "user:export"],
  "status": true,
  "remark": "系统管理员"
}
```

**2. 创建用户**

```http
POST http://localhost:3090/v1/users
Content-Type: application/json

{
  "username": "admin",
  "nickname": "管理员",
  "password": "admin123",
  "email": "admin@example.com",
  "roleId": "角色ID",
  "status": true
}
```

**3. 登录获取 Token**

```http
POST http://localhost:3090/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

响应：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "username": "admin",
      "nickname": "管理员",
      "email": "admin@example.com"
    }
  }
}
```

## 🔐 使用 JWT 认证

### 在 Swagger 中使用

1. 点击右上角的 **Authorize** 按钮
2. 输入 Token：`Bearer your-access-token`
3. 点击 **Authorize**
4. 现在可以调用需要认证的接口了

### 在 Postman 中使用

1. 选择 **Authorization** 标签
2. Type 选择 **Bearer Token**
3. 粘贴 access_token
4. 发送请求

### 在代码中使用

```typescript
// 请求头
headers: {
  'Authorization': 'Bearer your-access-token'
}
```

## 📚 API 使用示例

### 用户管理

**获取用户列表（分页）**
```http
GET http://localhost:3090/v1/users?page=1&limit=10&username=admin
Authorization: Bearer your-token
```

**创建用户**
```http
POST http://localhost:3090/v1/users
Authorization: Bearer your-token
Content-Type: application/json

{
  "username": "testuser",
  "nickname": "测试用户",
  "password": "test123",
  "email": "test@example.com",
  "status": true
}
```

**更新用户**
```http
PATCH http://localhost:3090/v1/users/{userId}
Authorization: Bearer your-token
Content-Type: application/json

{
  "nickname": "新昵称",
  "email": "newemail@example.com"
}
```

**删除用户**
```http
DELETE http://localhost:3090/v1/users/{userId}
Authorization: Bearer your-token
```

### 角色管理

**获取角色列表**
```http
GET http://localhost:3090/v1/roles
Authorization: Bearer your-token
```

**创建角色**
```http
POST http://localhost:3090/v1/roles
Authorization: Bearer your-token
Content-Type: application/json

{
  "roleName": "编辑",
  "roleAuth": "editor",
  "perms": ["user:view", "user:create"],
  "status": true
}
```

### 权限管理

**获取权限树**
```http
GET http://localhost:3090/v1/permissions/tree
Authorization: Bearer your-token
```

**创建权限**
```http
POST http://localhost:3090/v1/permissions
Authorization: Bearer your-token
Content-Type: application/json

{
  "name": "用户管理",
  "key": "user",
  "parent_key": null,
  "auth": false,
  "sortOrder": 1,
  "status": true
}
```

### 文件上传

**上传单个文件**
```http
POST http://localhost:3090/v1/upload/single
Authorization: Bearer your-token
Content-Type: multipart/form-data

file: [选择文件]
```

**上传多个文件**
```http
POST http://localhost:3090/v1/upload/multiple
Authorization: Bearer your-token
Content-Type: multipart/form-data

files: [选择多个文件]
```

### 数据导出

**导出用户数据**
```http
GET http://localhost:3090/v1/users-enhanced/export
Authorization: Bearer your-token
```

**下载导入模板**
```http
GET http://localhost:3090/v1/users-enhanced/template
Authorization: Bearer your-token
```

## 🛠️ 开发工具

### 推荐的 VSCode 插件

- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **REST Client** - API 测试
- **MongoDB for VS Code** - 数据库管理

### 代码格式化

```bash
# 格式化代码
npm run format

# 检查代码规范
npm run lint
```

### 构建项目

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 🧪 测试

```bash
# 单元测试
npm run test

# E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:cov
```

## 🐛 常见问题

### 1. 端口被占用

**错误**: `Error: listen EADDRINUSE: address already in use :::3090`

**解决**:
- 修改 `.env.development` 中的 `PORT` 为其他端口
- 或者停止占用该端口的进程

### 2. 数据库连接失败

**错误**: `MongooseError: connect ECONNREFUSED`

**解决**:
- 确保 MongoDB 服务已启动
- 检查 `.env` 文件中的数据库配置
- 确认数据库端口和地址正确

### 3. JWT Token 过期

**错误**: `401 Unauthorized`

**解决**:
- 重新登录获取新的 Token
- 或者修改 `JWT_EXPIRES_IN` 延长过期时间

### 4. 文件上传失败

**错误**: `413 Payload Too Large`

**解决**:
- 检查文件大小是否超过 10MB
- 修改 `FILE_UPLOAD_CONFIG.MAX_FILE_SIZE` 调整限制

### 5. 权限不足

**错误**: `403 Forbidden`

**解决**:
- 确认用户角色和权限配置正确
- 检查接口的 `@Roles` 和 `@RequirePermissions` 装饰器

## 📖 更多文档

- [项目架构文档](./ARCHITECTURE.md)
- [高级功能指南](./ADVANCED-FEATURES.md)
- [重构总结](./REFACTORING-SUMMARY.md)
- [项目总结](./PROJECT-SUMMARY.md)
- [中文文档](./README-ZH.md)

## 🔗 相关链接

- [NestJS 官方文档](https://docs.nestjs.com/)
- [Mongoose 文档](https://mongoosejs.com/)
- [Swagger/OpenAPI](https://swagger.io/)
- [JWT 介绍](https://jwt.io/)

## 💡 开发建议

1. **使用 Swagger 文档** - 所有接口都有详细的文档说明
2. **查看示例代码** - `users-enhanced.controller.ts` 包含了所有高级功能的使用示例
3. **遵循代码规范** - 参考 `ARCHITECTURE.md` 了解项目规范
4. **使用公共工具** - 充分利用 `common/` 目录下的工具类和装饰器
5. **编写测试** - 为关键业务逻辑编写单元测试

## 🎯 下一步

- [ ] 配置 Redis 缓存
- [ ] 实现消息队列
- [ ] 添加定时任务
- [ ] 集成日志系统
- [ ] 实现数据导入功能
- [ ] 添加单元测试

---

**版本**: 2.0.0  
**更新时间**: 2026-05-28  
**维护者**: Development Team

如有问题，请查看文档或提交 Issue。
