<template>
  <div v-show="getShow">
    <h2 class="login-title">登录</h2>
    <a-form
        loading
        :model="state.formState"
        name="normal_login"
        class="login-form"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
    >
      <a-form-item
          name="username"
          :rules="[{ required: true, message: '请输入用户名!' }]"
      >
        <a-input v-model:value="state.formState.username" allowClear autocomplete="off" size="large"
                 placeholder="用户名">
          <template #prefix>
            <IconFont type="icon-yonghuming" style="font-size: 18px"/>
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
          name="password"
          :rules="[{ required: true, message: '请输入密码!' }]"
      >
        <a-input-password v-model:value="state.formState.password" allowClear autocomplete="off" placeholder="密码"
                          size="large">
          <template #prefix>
            <IconFont type="icon-mima" style="font-size: 18px"/>
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item
          name="code"
          :rules="[{ required: true, message: '请输入验证码!' }]"
      >
        <div style="display: flex">
          <a-input v-model:value="state.formState.code" allowClear autocomplete="off" size="large" placeholder="验证码">
            <template #prefix>
              <IconFont type="icon-yanzhengma" style="font-size: 18px"/>
            </template>
          </a-input>
          <div class="login-code" v-html="state.captchaSvg" @click="getCaptcha"></div>
        </div>
      </a-form-item>
      <a-form-item>
        <a-form-item name="remember" no-style>
          <a-checkbox v-model:checked="state.formState.remember">记住密码</a-checkbox>
        </a-form-item>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" style="width: 100%" :disabled="disabled" html-type="submit" size="large"
                  class="login-form-button">
          登录
        </a-button>
      </a-form-item>
    </a-form>
    <div>
      <a-space class="login-btn-list">
        <a-button @click="setLoginState('register')" class="login-form-button">
          注册
        </a-button>
        <a-button @click="setOtherUser" class="login-form-button">
          其他用户
        </a-button>
        <a-button disabled class="login-form-button">
          手机登录
        </a-button>
        <a-button disabled class="login-form-button">
          扫二维码登录
        </a-button>
      </a-space>
    </div>
    <a-divider class="hr">其他方式登录</a-divider>
    <div class="other-login-type">
      <IconFont class="type-item" type="icon-github"/>
      <IconFont class="type-item" type="icon-gitee"/>
      <IconFont class="type-item" type="icon-weixin"/>
      <IconFont class="type-item" type="icon-weibo"/>
      <IconFont class="type-item" type="icon-qq"/>
    </div>
  </div>
</template>

<script setup>
import {reactive, ref, computed} from 'vue';
import loginBg from '@/assets/img/login-bg.png';
import {SmileOutlined} from '@ant-design/icons-vue';
import {notification} from 'ant-design-vue';

import {useAuthStore} from '../../../../stores/auth.js';
import {useLoginState} from '@/hooks/sys/useLogin.js';
import {authCaptcha} from "../../../../api/modules/api.auth";

const authStore = useAuthStore()
const {setLoginState, getLoginState} = useLoginState();
const getShow = computed(() => {
  return getLoginState.value === 'login'
});


const state = reactive({
  formState: {
    username: 'admin',
    password: 'admin',
  },
  captchaSvg: ''
})

const getCaptcha = () => {
 /* authCaptcha().then(res => {
    state.captchaSvg = ref(res.data)
  }).catch(err => {
  })*/

  let res={
    "status": 1,
    "message": "成功.",
    "data": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"90\" height=\"38\" viewBox=\"0,0,90,38\"><path fill=\"#57dfbd\" d=\"M22.96 21.19L22.99 21.23L22.93 21.16Q23.58 21.03 24.97 20.88L25.02 20.94L25.00 20.92Q25.00 21.59 25.00 22.22L24.99 22.22L25.00 23.46L25.05 23.50Q24.30 23.58 23.48 23.65L23.34 23.52L23.34 23.52Q22.50 23.54 21.68 23.50L21.64 23.46L21.64 23.46Q18.90 29.59 15.54 34.11L15.63 34.21L15.54 34.11Q13.16 34.84 11.89 35.44L11.81 35.35L11.91 35.46Q15.94 29.84 18.93 23.67L18.77 23.51L16.20 23.52L16.22 23.54Q16.33 22.34 16.22 21.03L16.08 20.89L16.18 20.99Q18.03 21.13 20.05 21.13L20.03 21.10L22.01 17.59L22.00 17.58Q22.94 15.68 24.14 14.11L24.19 14.16L24.06 14.03Q22.49 14.14 20.92 14.14L21.04 14.27L20.91 14.13Q15.01 14.22 11.31 12.05L11.25 11.99L10.73 10.42L10.74 10.43Q10.39 9.60 10.02 8.74L9.98 8.70L9.93 8.65Q14.20 11.24 19.81 11.46L19.89 11.54L19.78 11.44Q24.90 11.73 29.95 9.78L29.89 9.73L30.02 9.86Q29.75 10.19 29.26 11.05L29.31 11.09L29.27 11.05Q25.74 15.75 22.93 21.17ZM30.84 12.40L30.81 12.37L31.79 10.39L31.89 10.49Q30.86 10.88 29.21 11.59L29.21 11.59L29.40 11.29L29.38 11.27Q29.46 11.09 29.57 10.98L29.59 10.99L29.57 10.98Q29.93 10.29 30.64 8.98L30.65 9.00L30.63 8.97Q25.45 11.27 19.81 11.05L19.88 11.13L19.89 11.13Q13.97 10.86 9.29 7.94L9.18 7.82L9.29 7.93Q10.30 9.77 11.12 12.38L11.04 12.30L11.12 12.39Q12.15 12.96 12.93 13.26L13.02 13.35L13.04 13.37Q13.19 13.71 13.64 15.54L13.59 15.49L13.54 15.44Q16.57 16.60 21.99 16.45L22.02 16.48L22.02 16.48Q21.81 17.13 19.87 20.83L19.91 20.87L19.91 20.87Q17.79 20.77 15.84 20.58L15.86 20.60L15.89 20.63Q15.85 21.33 15.85 22.19L15.97 22.32L15.91 23.94L17.49 23.88L17.51 25.28L17.51 25.28Q13.70 32.58 10.98 36.09L10.94 36.05L10.92 36.04Q12.64 35.44 14.25 34.95L14.14 34.85L14.09 34.80Q13.47 35.75 12.13 37.43L12.09 37.40L12.16 37.47Q15.36 36.47 17.75 36.25L17.62 36.12L17.62 36.12Q20.58 32.50 23.64 25.84L23.71 25.90L27.01 26.03L26.95 25.96Q26.94 25.14 26.94 24.24L26.88 24.18L26.85 22.39L26.83 22.37Q26.61 22.41 26.06 22.45L26.07 22.45L26.00 22.38Q25.49 22.45 25.22 22.45L25.20 22.42L25.39 22.61Q25.27 22.38 25.31 22.23L25.29 22.21L25.29 21.96L25.30 21.96Q27.78 16.93 30.81 12.36Z\"/><path d=\"M8 10 C60 11,56 4,77 3\" stroke=\"#e994e9\" fill=\"none\"/><path fill=\"#8da6f0\" d=\"M59.96 34.13L59.83 33.99L59.81 33.97Q58.47 34.10 56.94 33.68L56.91 33.65L56.91 33.66Q55.69 32.74 55.55 31.13L55.68 31.27L55.59 31.17Q55.63 31.07 55.82 28.49L55.83 28.50L55.70 28.37Q56.77 28.24 58.75 27.87L58.82 27.94L58.65 28.70L58.60 28.65Q58.25 30.28 59.63 30.84L59.69 30.90L59.72 30.93Q60.43 31.19 62.49 31.19L62.48 31.18L62.60 31.30Q64.05 31.04 64.24 30.96L64.23 30.95L64.27 30.99Q65.20 30.87 65.91 30.39L65.95 30.43L65.91 30.39Q67.28 29.44 67.09 27.38L67.19 27.48L67.21 27.50Q67.02 25.11 65.32 23.57L65.27 23.52L65.22 23.47Q63.49 21.92 61.06 21.92L61.06 21.91L61.11 21.74L61.11 21.74Q61.47 21.69 62.33 21.61L62.32 21.60L62.40 21.68Q64.26 21.56 65.61 20.35L65.52 20.26L65.47 20.21Q66.84 19.01 66.99 17.18L67.07 17.26L66.96 17.15Q67.16 16.94 67.16 16.61L67.09 16.53L67.13 16.58Q67.03 14.98 65.69 14.09L65.84 14.24L65.80 14.20Q64.63 13.44 63.06 13.55L63.10 13.60L63.00 13.49Q61.83 13.45 60.64 13.86L60.55 13.77L60.50 13.72Q59.17 14.33 58.87 15.46L58.87 15.46L58.90 15.49Q58.71 16.23 58.79 16.98L58.78 16.98L58.75 16.94Q57.65 16.63 55.63 15.92L55.78 16.07L55.59 15.88Q55.37 14.24 55.41 13.42L55.43 13.44L55.44 13.45Q55.70 12.10 56.74 11.43L56.75 11.43L56.63 11.32Q58.05 10.75 59.62 10.75L59.54 10.67L59.59 10.72Q62.77 10.76 65.87 11.02L65.76 10.91L65.91 11.06Q70.74 11.33 70.44 15.03L70.44 15.03L70.57 15.15Q70.42 16.54 69.94 18.08L70.02 18.16L70.00 18.14Q69.03 21.10 66.71 22.00L66.74 22.02L66.78 22.06Q69.30 22.53 69.90 25.82L69.98 25.89L69.88 25.80Q70.15 26.96 70.22 28.94L70.15 28.87L70.24 28.96Q70.42 33.36 65.89 33.81L65.86 33.77L65.86 33.78Q65.12 33.82 59.92 34.08ZM65.08 36.33L65.12 36.37L65.04 36.29Q65.58 36.27 68.39 36.34L68.40 36.35L68.41 36.37Q70.11 36.42 71.71 35.78L71.66 35.73L71.79 35.86Q72.87 34.84 72.68 33.12L72.65 33.09L72.80 33.24Q72.69 31.93 72.39 30.21L72.38 30.20L72.34 30.16Q71.51 25.63 69.61 24.03L69.72 24.14L69.60 23.83L69.56 23.75L69.51 23.70Q71.18 22.24 71.93 17.94L71.89 17.89L71.89 17.90Q71.93 17.45 72.04 16.52L72.05 16.53L72.00 16.48Q72.19 15.84 72.12 15.17L72.17 15.22L72.14 15.20Q72.00 13.56 70.73 12.89L70.69 12.84L70.67 12.90L70.54 12.77Q70.24 11.80 69.12 11.27L69.19 11.35L69.09 11.25Q67.60 10.58 62.55 10.28L62.63 10.36L62.72 10.45Q60.90 10.20 59.33 10.20L59.43 10.30L59.36 10.23Q57.81 10.25 56.31 10.88L56.29 10.86L56.37 10.94Q55.10 11.62 55.10 13.34L55.09 13.33L55.17 13.41Q55.14 12.97 55.41 16.26L55.49 16.34L55.36 16.21Q55.70 16.33 57.31 16.93L57.29 16.90L57.24 16.86Q57.24 17.38 57.20 17.87L57.27 17.94L57.22 17.89Q57.30 18.45 57.33 18.97L57.35 18.99L57.36 19.00Q59.01 19.26 60.99 19.37L61.15 19.54L61.02 19.40Q60.90 17.38 61.99 16.56L62.14 16.71L62.16 16.73Q62.81 15.92 64.79 15.70L64.88 15.79L64.96 15.86Q65.94 15.72 66.50 15.91L66.63 16.04L66.65 16.06Q66.55 16.03 66.58 16.14L66.71 16.27L66.70 16.45L66.77 16.97L66.84 17.04Q66.67 17.05 66.63 17.20L66.68 17.25L66.72 17.29Q66.62 18.95 65.13 20.11L65.05 20.03L65.19 20.18Q64.14 20.92 62.16 21.11L62.27 21.21L62.16 21.11Q61.58 21.39 60.72 21.39L60.73 21.40L60.63 21.30Q60.66 21.62 60.81 22.29L60.90 22.38L60.94 22.43Q62.62 22.38 64.04 23.09L64.04 23.10L63.99 23.16L62.40 23.29L62.38 23.27Q62.40 23.59 62.51 24.19L62.51 24.18L62.50 24.18Q64.69 24.20 66.37 25.51L66.24 25.37L66.21 25.34Q66.56 25.85 66.86 27.45L66.91 27.50L66.86 27.45Q66.97 30.25 64.09 30.66L64.17 30.74L64.13 30.70Q62.14 31.03 61.58 31.00L61.52 30.93L61.57 30.98Q61.12 30.87 60.60 30.79L60.54 30.74L60.49 30.24L60.55 29.74L60.70 29.48L60.65 29.09L60.64 29.08Q59.87 29.32 59.08 29.51L58.95 29.38L59.05 29.48Q58.89 29.13 58.89 28.94L59.00 29.05L58.95 29.00Q59.09 28.92 59.09 28.69L58.97 28.57L59.04 28.65Q59.00 28.15 59.15 27.44L59.13 27.42L59.13 27.43Q57.41 27.76 55.58 28.10L55.52 28.04L55.45 27.97Q55.44 28.45 55.33 29.55L55.43 29.65L55.47 29.69Q55.38 30.81 55.38 31.41L55.36 31.39L55.30 31.33Q55.46 33.43 56.80 34.18L56.71 34.09L56.72 34.10Q58.25 36.41 62.89 36.23L62.73 36.07L62.91 36.25Q63.47 36.06 64.97 36.21Z\"/><path fill=\"#52dfdf\" d=\"M42.49 33.14L42.62 33.27L42.59 33.24Q41.87 33.15 41.20 33.19L41.12 33.11L41.12 33.11Q40.50 33.28 39.83 33.28L39.77 33.22L39.81 33.26Q40.32 29.95 40.32 26.59L40.33 26.60L40.34 26.62Q38.57 26.67 37.67 26.67L37.53 26.54L37.61 26.61Q36.83 26.65 35.03 26.58L34.97 26.51L35.01 26.55Q34.96 26.21 34.78 23.78L34.71 23.71L34.84 23.84Q37.30 24.32 40.22 24.32L40.17 24.28L40.26 24.36Q39.98 20.00 39.56 17.46L39.60 17.49L39.63 17.53Q40.40 17.62 41.18 17.62L41.20 17.64L42.83 17.66L42.81 17.64Q42.61 21.85 42.61 24.39L42.50 24.28L42.55 24.33Q44.60 24.25 47.74 23.92L47.74 23.91L47.79 23.97Q47.76 25.36 47.76 26.56L47.73 26.52L47.72 26.52Q47.39 26.45 46.60 26.48L46.64 26.52L46.57 26.45Q45.57 26.42 44.97 26.46L45.03 26.51L45.16 26.65Q45.14 26.63 42.53 26.63L42.36 26.47L42.47 29.94L42.35 29.82Q42.46 31.54 42.57 33.22ZM48.19 23.47L48.21 23.49L48.23 23.51Q46.35 23.80 44.52 23.88L44.44 23.79L44.55 23.91Q44.68 20.71 45.09 18.88L45.15 18.94L45.11 18.89Q44.50 19.03 43.11 19.18L43.12 19.18L43.20 17.06L43.35 17.21Q40.65 17.09 39.01 16.98L39.02 16.99L39.03 17.01Q39.61 20.09 39.80 23.90L39.77 23.87L39.88 23.98Q38.06 23.85 34.44 23.25L34.32 23.14L34.33 23.15Q34.75 24.47 34.75 27.05L34.76 27.06L36.20 27.00L36.08 26.88Q36.20 27.70 36.05 29.09L35.99 29.03L39.85 28.74L39.96 28.85Q39.67 31.88 39.37 33.68L39.38 33.69L39.39 33.70Q40.14 33.70 41.52 33.59L41.48 33.54L41.50 33.57Q41.60 34.35 41.57 35.65L41.48 35.57L41.42 35.50Q41.91 35.47 45.46 35.62L45.64 35.81L45.59 35.75Q44.57 32.60 44.35 28.71L44.52 28.88L44.44 28.81Q47.60 28.79 49.65 29.16L49.79 29.29L49.74 29.25Q49.58 28.34 49.58 27.41L49.50 27.32L49.57 25.53L49.49 25.45Q49.28 25.45 48.75 25.49L48.78 25.52L48.10 25.62L48.12 25.64Q48.03 24.77 48.14 23.42Z\"/></svg>",
    "time": 1694588381965
  }
  state.captchaSvg = ref(res.data)

}

const setOtherUser = () => {
  state.formState.username = 'test'
}

const onFinish = values => {
  authStore.login(values).then(res => {
  }).catch(err => {
    getCaptcha()
  })
};
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};
const disabled = computed(() => {
  return !(state.formState.username && state.formState.password);
});

getCaptcha()

</script>

<style lang="scss" scoped>
.login-title {
  margin-bottom: 30px;
}

.hr {
  font-size: .9rem;
  color: #575656;
}

.login-form {
  max-width: 400px;
  background-color: #fff;
  overflow: hidden;

  .login-code {
    cursor: pointer;
  }
}

.login-btn-list {
  display: flex;
  flex-wrap: wrap;
}

.other-login-type {
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 22px;

  .type-item {
    cursor: pointer;

    &:hover {
      color: $color-primary !important;
    }
  }
}
</style>
