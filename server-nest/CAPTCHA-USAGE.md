# 验证码功能说明（与原项目一致）

## 📝 实现说明

本验证码实现完全参考原 Express 项目，保持接口和使用方式一致。

## 🔄 与原项目对比

### 原 Express 项目

**路由**: `GET /v1/sys/auth/captcha`

**实现**:
```javascript
// controllers/v1/sys/AuthController.js
exports.captcha = [
    async (req, res) => {
        let options = {
            noise: Math.floor(Math.random() * 5),
            color: true,
            fontSize: 55,
            width: 90,
            height: 38,
        }
        let captcha = svgCaptcha.createMathExpr(options)
        req.session.code = captcha.text
        apiResponse.successResponseWithData(res, "成功.", captcha.data);
    }
]
```

**登录验证**:
```javascript
exports.login = [
    async (req, res) => {
        if (!req.session.code) 
            return apiResponse.validationErrorWithData(res, "验证码已失效");
        if (req.session.code !== req.body.code) 
            return apiResponse.validationErrorWithData(res, "验证码错误");
        // ... 登录逻辑
    }
]
```

### NestJS 项目（新实现）

**路由**: `GET /v1/sys/auth/captcha` ✅ 完全一致

**实现**:
```typescript
// modules/captcha/captcha.controller.ts
@Get('captcha')
@Public()
getCaptcha(@Session() session: Record<string, any>) {
    const options = {
        noise: Math.floor(Math.random() * 5),
        color: true,
        fontSize: 55,
        width: 90,
        height: 38,
    };
    
    const captcha = this.captchaService.generateMathCaptcha(options);
    session.code = captcha.text;
    
    return captcha.data;
}
```

**登录验证**:
```typescript
// modules/auth/auth.controller.ts
@Post('login')
async login(@Body() loginDto: LoginDto, @Session() session: Record<string, any>) {
    if (!loginDto.code) {
        throw new BadRequestException('验证码不能为空');
    }
    
    if (!session.code) {
        throw new BadRequestException('验证码已失效');
    }
    
    if (session.code !== loginDto.code) {
        throw new BadRequestException('验证码错误');
    }
    
    delete session.code;
    return this.authService.login(loginDto);
}
```

## 🚀 使用方法

### 1. 获取验证码

```http
GET http://localhost:3090/v1/sys/auth/captcha
```

**响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": "<svg xmlns='http://www.w3.org/2000/svg' ...>...</svg>"
}
```

### 2. 登录时提交验证码

```http
POST http://localhost:3090/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "code": "5"
}
```

**注意**: `code` 是数学表达式的答案，例如 `2+3=?` 答案是 `5`

## 💻 前端示例

### Vue 3 完整示例

```vue
<template>
  <div class="login-container">
    <el-form :model="loginForm" :rules="rules" ref="formRef">
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="用户名" />
      </el-form-item>
      
      <el-form-item prop="password">
        <el-input 
          v-model="loginForm.password" 
          type="password" 
          placeholder="密码" 
        />
      </el-form-item>
      
      <el-form-item prop="code">
        <div class="captcha-box">
          <el-input 
            v-model="loginForm.code" 
            placeholder="验证码" 
            style="width: 60%"
          />
          <div 
            class="captcha-img" 
            v-html="captchaSvg"
            @click="getCaptcha"
            title="点击刷新"
          ></div>
        </div>
      </el-form-item>
      
      <el-button type="primary" @click="handleLogin" :loading="loading">
        登录
      </el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const formRef = ref();
const loading = ref(false);
const captchaSvg = ref('');

const loginForm = ref({
  username: '',
  password: '',
  code: '',
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
};

// 获取验证码
const getCaptcha = async () => {
  try {
    const { data } = await axios.get('/v1/sys/auth/captcha');
    captchaSvg.value = data.data;
  } catch (error) {
    ElMessage.error('获取验证码失败');
  }
};

// 登录
const handleLogin = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;
  
  loading.value = true;
  try {
    const { data } = await axios.post('/v1/auth/login', loginForm.value);
    
    // 保存 token
    localStorage.setItem('token', data.data.access_token);
    
    ElMessage.success('登录成功');
    // 跳转到首页
    // router.push('/');
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '登录失败');
    // 登录失败刷新验证码
    getCaptcha();
    loginForm.value.code = '';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getCaptcha();
});
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.captcha-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-img {
  width: 90px;
  height: 38px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.3s;
}

.captcha-img:hover {
  border-color: #409eff;
  box-shadow: 0 0 5px rgba(64, 158, 255, 0.3);
}

.captcha-img :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
```

## 🔧 配置说明

### Session 配置

在 `main.ts` 中已配置：

```typescript
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
```

### CORS 配置

```typescript
app.enableCors({
  origin: true,
  credentials: true, // 允许携带 cookie
});
```

### 前端 Axios 配置

```typescript
// 必须配置，否则 session 无法工作
axios.defaults.withCredentials = true;
```

## ⚠️ 注意事项

1. **Session 依赖 Cookie**
   - 前端必须配置 `withCredentials: true`
   - 后端必须配置 `credentials: true`

2. **验证码类型**
   - 使用数学表达式验证码（与原项目一致）
   - 答案存储在 `session.code` 中

3. **验证码有效期**
   - Session 默认 30 分钟过期
   - 验证码使用后立即删除

4. **错误处理**
   - 登录失败后应刷新验证码
   - 清空验证码输入框

## 📊 接口对比

| 项目 | 路由 | 存储位置 | 验证方式 |
|------|------|----------|----------|
| Express | `/v1/sys/auth/captcha` | `req.session.code` | 手动验证 |
| NestJS | `/v1/sys/auth/captcha` | `session.code` | 手动验证 |

✅ **完全一致**

## 🎯 测试步骤

1. **获取验证码**
```bash
curl http://localhost:3090/v1/sys/auth/captcha
```

2. **查看验证码**
   - 在浏览器中打开上述 URL
   - 会显示一个数学表达式，例如 `2+3=?`

3. **登录测试**
```bash
curl -X POST http://localhost:3090/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "code": "5"
  }'
```

## 📝 总结

✅ 路由地址一致: `/v1/sys/auth/captcha`  
✅ 存储方式一致: `session.code`  
✅ 验证逻辑一致: 登录时校验 `code` 字段  
✅ 验证码类型一致: 数学表达式  
✅ 配置参数一致: noise, color, fontSize, width, height  

完全兼容原 Express 项目的前端代码！
