<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-2xl">
      <!-- User Info Card -->
      <div class="bg-white rounded-2xl shadow-sm p-8 text-center mb-6">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl overflow-hidden">
              <img v-if="userInfo.avatar" :src="userInfo.avatar" class="w-full h-full object-cover">
              <span v-else>👤</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">{{ userInfo.name || '用户姓名' }}</h2>
          <p class="text-gray-500">{{ userInfo.phone || '未绑定手机号' }}</p>
      </div>

      <!-- Menu List -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-50">
          <div @click="router.push('/order')" class="p-6 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b border-gray-50">
              <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">📦</div>
                  <span class="font-bold text-gray-700">我的订单</span>
              </div>
              <span class="text-gray-400">&rarr;</span>
          </div>

          <div @click="router.push('/address')" class="p-6 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b border-gray-50">
              <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">📍</div>
                  <span class="font-bold text-gray-700">地址管理</span>
              </div>
              <span class="text-gray-400">&rarr;</span>
          </div>

          <div class="p-6 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">🛡️</div>
                  <span class="font-bold text-gray-700">修改密码</span>
              </div>
              <span class="text-gray-400">&rarr;</span>
          </div>
      </div>

      <!-- Logout -->
      <button @click="handleLogout" class="w-full mt-8 py-4 bg-white text-red-500 font-bold rounded-2xl border border-red-50 hover:bg-red-50 transition">
          退出当前账号
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const userInfo = reactive({
    name: '',
    phone: '',
    avatar: ''
})

const handleLogout = () => {
    ElMessageBox.confirm('确定退出登录吗？', '提示', { type: 'warning' }).then(() => {
        localStorage.clear()
        router.push('/login')
    })
}

onMounted(() => {
    // 从 localStorage 恢复简单信息
    userInfo.phone = '138****8000' // Mock
    userInfo.name = 'Somago 采购员'
})
</script>
