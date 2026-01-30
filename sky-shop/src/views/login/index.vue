<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '@/api/user'

const router = useRouter()
const route = useRoute()
const form = reactive({ phone: '', code: 'test_login_code' }) // 默认测试 Code
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
    loading.value = true
    errorMsg.value = ''
    try {
        console.log('Attempting login with code:', form.code)
        const res: any = await login({ code: form.code })
        console.log('Login response:', res)
        
        if (res && res.token) {
            localStorage.setItem('token', res.token)
            localStorage.setItem('userId', res.id)
            console.log('Token saved:', res.token)
            const redirect = (route.query.redirect as string) || '/'
            router.push(redirect)
        } else {
            errorMsg.value = '登录失败：后端未返回 Token'
        }
    } catch (e: any) {
        console.error('Login error:', e)
        errorMsg.value = e.message || '登录请求失败'
    } finally {
        loading.value = false
    }
}

const handleGuest = () => {
    // 游客模式 (仅供前端路由跳转，无真实数据权限)
    localStorage.setItem('token', 'guest-token')
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        登录 Somago 商城
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- 这里手机号其实没用，后端只看 code，但在界面上保留是为了以后扩展 -->
          <!-- 为了测试方便，我们把 label 改一下 -->
          
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700">
              微信授权码 (测试 Code)
            </label>
            <div class="mt-1">
              <input id="code" v-model="form.code" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
            </div>
            <p class="mt-1 text-xs text-gray-500">提示: 后端可能预设了 'test_login_code' 为后门。</p>
          </div>

          <div v-if="errorMsg" class="text-red-500 text-sm text-center">{{ errorMsg }}</div>

          <div>
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
              {{ loading ? '登录中...' : '一键登录' }}
            </button>
          </div>
        </form>

        <div class="mt-6">
           <button @click="handleGuest" class="w-full text-center text-sm text-gray-500 hover:text-gray-700">
             游客预览 (无数据)
           </button>
        </div>
      </div>
    </div>
  </div>
</template>
