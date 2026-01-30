<template>
  <header class="bg-white shadow-sm fixed w-full top-0 z-50">
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center space-x-2 cursor-pointer" @click="$router.push('/')">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">S</div>
        <span class="text-xl font-bold text-dark">Somago</span>
      </div>

      <!-- PC Navigation -->
      <nav class="hidden md:flex space-x-8">
        <router-link to="/" class="text-gray-600 hover:text-primary transition">首页</router-link>
        <router-link to="/products" class="text-gray-600 hover:text-primary transition">全部产品</router-link>
        <a href="#" class="text-gray-600 hover:text-primary transition">解决方案</a>
        <a href="#" class="text-gray-600 hover:text-primary transition">关于我们</a>
      </nav>

      <!-- Right Actions -->
      <div class="flex items-center space-x-4 relative">
        <!-- Desktop search (hidden by default, toggle panel) -->
        <div class="hidden md:block relative">
          <button class="text-gray-500 hover:text-primary" @click="toggleSearch">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
          <div
            v-if="showSearch"
            class="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-lg shadow-lg p-3 flex space-x-2"
          >
            <input
              v-model="searchText"
              @keyup.enter="doSearch"
              type="text"
              class="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="搜索产品或品牌"
            />
            <button class="px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-blue-600 transition" @click="doSearch">搜索</button>
          </div>
        </div>
        <!-- Mobile search icon -->
        <button class="md:hidden text-gray-500 hover:text-primary" @click="$router.push('/products')">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
        
        <!-- Cart -->
        <button class="relative text-gray-500 hover:text-primary" @click="$router.push('/cart')">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
           <span v-if="cartStore.totalCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
             {{ cartStore.totalCount }}
           </span>
        </button>

        <!-- User / Login -->
        <div class="hidden md:flex items-center relative group">
           <template v-if="isLoggedIn">
               <button class="flex items-center space-x-2 text-gray-700 hover:text-primary focus:outline-none">
                   <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                       <img v-if="userAvatar" :src="userAvatar" class="w-full h-full object-cover">
                       <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                   </div>
               </button>
               
               <!-- Dropdown Menu (Hover) -->
               <div class="absolute right-0 top-full pt-2 w-48 hidden group-hover:block hover:block">
                   <div class="bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                       <router-link to="/user" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">个人中心</router-link>
                       <router-link to="/order" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">我的订单</router-link>
                       <div class="border-t border-gray-100 my-1"></div>
                       <router-link to="/login" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">切换账号</router-link>
                       <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">退出登录</button>
                   </div>
               </div>
           </template>
           
           <template v-else>
               <button 
                  @click="handleDemoLogin" 
                  class="text-sm font-medium text-primary border border-primary px-6 py-1.5 rounded-full hover:bg-primary hover:text-white transition"
               >
                   登录 / 注册
               </button>
           </template>
        </div>

        <!-- Mobile Menu Button -->
        <button class="md:hidden text-gray-600" @click="isOpen = !isOpen">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Drawer -->
    <div v-show="isOpen" class="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-16 shadow-lg h-screen pb-20">
        <div class="flex flex-col p-4 space-y-4">
            <router-link to="/" class="text-gray-700 font-medium py-2 border-b border-gray-50" @click="isOpen = false">首页</router-link>
            <router-link to="/products" class="text-gray-700 font-medium py-2 border-b border-gray-50" @click="isOpen = false">全部商品</router-link>
            <a href="#" class="text-gray-700 font-medium py-2 border-b border-gray-50">个人中心</a>
            
            <div v-if="isLoggedIn">
                <button @click="handleLogout" class="text-red-600 font-medium py-2 w-full text-left">退出登录</button>
            </div>
            <div v-else>
                <router-link to="/login" class="block text-center bg-primary text-white py-3 rounded-lg font-bold mt-4" @click="isOpen = false">
                    登录 / 注册
                </router-link>
            </div>
        </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '@/api/user'
import { useCartStore } from '@/store/cart'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const isOpen = ref(false)
const userAvatar = ref('')
const isLoggedIn = ref(!!localStorage.getItem('token'))
const searchText = ref('')
const showSearch = ref(false)

const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userAvatar')
    cartStore.cartList = []
    isLoggedIn.value = false
    isOpen.value = false
    router.push('/login')
}

const handleDemoLogin = async () => {
    try {
        console.log('Starting demo login...')
        const res: any = await login({ code: 'test_login_code' })
        console.log('Login result:', res)
        
        if (res && res.token) {
            localStorage.setItem('token', res.token)
            localStorage.setItem('userId', res.id)
            isLoggedIn.value = true
            // 如果在首页，尝试刷新数据
            if (router.currentRoute.value.path === '/' || router.currentRoute.value.path === '/products') {
                window.location.reload() 
            }
        } else {
            console.error('Login failed: No token returned')
            ElMessage.error('演示登录失败：后端未返回Token')
        }
    } catch (e) {
        console.error('Demo login error:', e)
        ElMessage.error('演示登录失败，请检查控制台')
    }
}

onMounted(() => {
    // 可以在这里获取用户信息
    userAvatar.value = localStorage.getItem('userAvatar') || ''
    if (localStorage.getItem('token')) {
        cartStore.fetchCart()
    }
})

const doSearch = () => {
    router.push({ path: '/products', query: { keyword: searchText.value || undefined } })
    showSearch.value = false
}

watch(() => route.query.keyword, (val) => {
    searchText.value = val ? String(val) : ''
}, { immediate: true })

const toggleSearch = () => {
    showSearch.value = !showSearch.value
}
</script>
