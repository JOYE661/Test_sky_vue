<template>
  <div class="login-container">
    <div class="logo-box">
      <img src="../../assets/login/logo.png" alt="logo" class="logo" v-if="hasLogo" />
      <h2 v-else>苍穹外卖</h2>
      <p class="sub-title">欢迎回来</p>
    </div>
    
    <div class="form-box">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="authCode"
            name="code"
            label="Auth Code"
            placeholder="请输入微信授权码 (测试用)"
            :rules="[{ required: true, message: '请填写授权码' }]"
          />
        </van-cell-group>
        <div style="margin: 30px 16px;">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            一键登录
          </van-button>
        </div>
      </van-form>
      <div class="tips">
        <p>提示: 这是一个 H5 演示客户端。</p>
        <p>如果后端开启了微信校验，请输入有效 Code。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/user'
import { showSuccessToast, showFailToast } from 'vant'

const router = useRouter()
const authCode = ref('test_login_code') // 默认填一个，方便调试
const loading = ref(false)
const hasLogo = ref(false) // 暂时没有 logo 图片

const onSubmit = async (values: any) => {
  loading.value = true
  try {
    // 调用登录接口
    const res = await login({ code: values.code })
    
    // 假设返回结构包含 token 和 user id
    // 根据接口文档，res 应该是返回的数据部分
    // 如果返回的是 { token: '...', ... }
    const data = res as any
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.id)
      if (data.name) localStorage.setItem('userName', data.name)
      if (data.avatar) localStorage.setItem('userAvatar', data.avatar)
      
      showSuccessToast('登录成功')
      router.replace('/home')
    } else {
      // 容错处理，万一后端直接返回 token 字符串或者结构不一样
       // 这里假设标准结构
      console.log('Login response:', data)
      showFailToast('登录异常: 无 Token')
    }
  } catch (error) {
    console.error(error)
    // showFailToast 已在 request 拦截器处理，这里可以忽略或做额外处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background-color: #fff;
  padding-top: 80px;

  .logo-box {
    text-align: center;
    margin-bottom: 40px;
    
    h2 {
      color: #333;
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .sub-title {
      color: #999;
      font-size: 14px;
    }
  }

  .tips {
    text-align: center;
    font-size: 12px;
    color: #ccc;
    margin-top: 20px;
    line-height: 1.5;
  }
}
</style>