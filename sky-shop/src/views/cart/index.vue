<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-5xl">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">购物车</h1>
        <button v-if="cartStore.cartList.length > 0" @click="handleClear" class="text-red-500 hover:text-red-700 text-sm flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          清空购物车
        </button>
      </div>

      <div v-if="shopStatus === 0" class="mb-6 p-4 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-100">
        敬请期待：商城暂未开放购买，暂不可加购或结算。
      </div>
      
      <div v-if="cartStore.loading" class="text-center py-20 text-gray-500">加载中...</div>
      
      <div v-else-if="cartStore.cartList.length === 0" class="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
         <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🛒</div>
         <h2 class="text-xl font-bold text-gray-800 mb-2">购物车还是空的</h2>
         <p class="text-gray-500 mb-8">快去选购一些优质的商品吧！</p>
         <router-link to="/products" class="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-100">
             开始选购
         </router-link>
      </div>
      
      <div v-else class="flex flex-col lg:flex-row gap-8">
          <!-- List -->
          <div class="flex-1 space-y-4">
              <div v-for="item in cartStore.cartList" :key="item.id" class="bg-white rounded-2xl shadow-sm p-4 flex items-center border border-gray-50 hover:border-blue-100 transition">
                  <img :src="getImageUrl(item.image)" class="w-24 h-24 object-cover rounded-xl" :alt="item.name">
                  <div class="ml-6 flex-1">
                      <h3 class="font-bold text-gray-900 text-lg mb-1">{{ item.name }}</h3>
                      <p class="text-sm text-gray-500 mb-2">{{ item.dishFlavor || '标准规格' }}</p>
                      <div class="text-primary font-bold">¥ {{ item.amount }} <span class="text-xs text-gray-400 font-normal">/ 份</span></div>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                      <!-- Quantity Controls -->
                      <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button @click="cartStore.minusFromCart(item)" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">-</button>
                          <span class="w-10 text-center text-gray-900 font-medium">{{ item.number }}</span>
                          <button
                            @click="handlePlus(item)"
                            class="w-8 h-8 flex items-center justify-center transition"
                            :class="shopStatus === 0 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-200'"
                            :disabled="shopStatus === 0"
                          >+</button>
                      </div>
                      
                      <!-- Subtotal -->
                      <div class="w-24 text-right">
                          <span class="font-bold text-gray-900">¥ {{ (item.amount * item.number).toFixed(2) }}</span>
                      </div>
                  </div>
              </div>
          </div>
          
          <!-- Summary Card -->
          <div class="lg:w-80">
              <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
                  <h2 class="text-xl font-bold mb-6 text-gray-900">费用总计</h2>
                  <div class="space-y-4 mb-6">
                      <div class="flex justify-between text-gray-600">
                          <span>商品合计</span>
                          <span>¥ {{ cartStore.totalPrice.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between text-gray-600">
                          <span>配送费</span>
                          <span class="text-green-500">免运费</span>
                      </div>
                      <div class="border-t border-gray-100 pt-4 flex justify-between items-end">
                          <span class="font-bold text-gray-900 text-lg">应付金额</span>
                          <span class="text-2xl font-bold text-red-600">¥ {{ cartStore.totalPrice.toFixed(2) }}</span>
                      </div>
                  </div>
                  <button
                    class="block w-full bg-primary text-white text-center py-4 rounded-xl font-bold transition shadow-lg shadow-blue-100 text-lg"
                    :class="shopStatus === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'hover:bg-blue-600'"
                    :disabled="shopStatus === 0"
                    @click="shopStatus === 0 ? ElMessage.warning('敬请期待，暂未开放购买') : $router.push('/order/create')"
                  >
                      立即结算
                  </button>
                  <p class="text-xs text-gray-400 mt-4 text-center">
                      点击结算代表您已阅读并同意《购买协议》
                  </p>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCartStore } from '@/store/cart'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getImageUrl } from '@/utils/image'
import { getShopStatus } from '@/api/shop'

const cartStore = useCartStore()
const shopStatus = ref(1)

const handleClear = () => {
    ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
        type: 'warning'
    }).then(() => {
        cartStore.clearAll()
        ElMessage.success('已清空')
    })
}

onMounted(() => {
    cartStore.fetchCart()
    initShopStatus()
})

const initShopStatus = async () => {
    try {
        const status: any = await getShopStatus()
        shopStatus.value = Number(status ?? 1)
    } catch (e) {
        console.error('Fetch shop status failed', e)
    }
}

const handlePlus = async (item: any) => {
    if (shopStatus.value === 0) {
        ElMessage.warning('敬请期待，暂未开放购买')
        return
    }
    await cartStore.addToCart({ 
        id: item.dishId || item.id, 
        dishId: item.dishId, 
        setmealId: item.setmealId, 
        selectedFlavor: item.dishFlavor, 
        categoryType: item.setmealId ? 2 : 1 
    })
}
</script>
