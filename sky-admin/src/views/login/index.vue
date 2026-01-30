<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>Somago 实时供应链系统</span>
        </div>
      </template>
      <el-form :model="loginForm" label-width="0px">
        <el-form-item>
          <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="handleLogin" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { login } from '@/api/employee'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  try {
    const res: any = await login(loginForm)
    // 假设 API 返回包含 token 和 employee id
    if (res && res.token) {
        userStore.setToken(res.token)
        localStorage.setItem('userInfo', JSON.stringify(res)) // 存储用户信息
        ElMessage.success('登录成功')
        router.push('/')
    } else {
        // 如果后端直接返回 token 字符串或者结构不一样，需要适配
        // 这里假设 res 已经是 response.data (在 request.ts 里处理过 code === 1)
        // 查看一下原项目，login 接口返回什么
        // 原项目 request.ts 没有解包 res.data，所以这里 request.ts 修改为返回 res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2d3a4b;
}
.login-card {
  width: 400px;
}
.card-header {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}
</style>
