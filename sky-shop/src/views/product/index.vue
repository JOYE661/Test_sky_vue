<template>
  <div class="bg-gray-50 min-h-screen pb-20">
    <!-- Header Filter Bar (Mobile) -->
    <div class="lg:hidden sticky top-16 z-40 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <div class="text-sm text-gray-500">共 {{ products.length }} 件产品</div>
      <button @click="showFilter = true" class="flex items-center text-gray-700 font-medium">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        筛选
      </button>
    </div>

    <div class="container mx-auto px-4 pt-4 lg:pt-8 flex lg:space-x-8">
      <!-- Sidebar Filter (PC) -->
      <aside class="hidden lg:block w-64 flex-shrink-0">
        <div class="bg-white rounded-lg shadow-sm p-6 space-y-8 sticky top-24">
          <!-- Categories -->
          <div>
            <h3 class="font-bold text-gray-900 mb-4">{{ categoryType === 1 ? '产品分类' : '品牌分类' }}</h3>
            <ul class="space-y-3 text-gray-600">
              <li 
                v-for="cat in categories" 
                :key="cat.id" 
                class="cursor-pointer hover:text-primary flex justify-between group"
                :class="activeCategoryId === cat.id ? 'text-primary font-bold' : ''"
                @click="handleCategoryClick(cat.id)"
              >
                <span>{{ cat.name }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Price Range -->
          <div>
            <h3 class="font-bold text-gray-900 mb-4">价格区间</h3>
            <div class="flex items-center space-x-2">
              <input type="number" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="¥ 最低">
              <span class="text-gray-400">-</span>
              <input type="number" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="¥ 最高">
            </div>
          </div>

          <button class="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition">应用筛选</button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
          <div class="flex items-center space-x-3">
            <button
              class="px-4 py-2 rounded-lg text-sm font-medium border transition"
              :class="categoryType === 1 ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'"
              @click="switchCategoryType(1)"
            >
              产品
            </button>
            <button
              class="px-4 py-2 rounded-lg text-sm font-medium border transition"
              :class="categoryType === 2 ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'"
              @click="switchCategoryType(2)"
            >
              品牌
            </button>
            <span
              class="text-sm font-medium flex items-center px-3 py-1 rounded-full border"
              :class="shopStatus === 1 ? 'text-green-600 border-green-200 bg-green-50' : 'text-yellow-700 border-yellow-200 bg-yellow-50'"
            >
              <span class="w-2 h-2 rounded-full mr-2" :class="shopStatus === 1 ? 'bg-green-500' : 'bg-yellow-500'"></span>
              {{ shopStatus === 1 ? '营业中' : '敬请期待' }}
            </span>
          </div>
          <div class="flex items-center space-x-2 w-full lg:w-80">
            <input
              v-model="keyword"
              @keyup.enter="handleSearch"
              type="text"
              class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              :placeholder="categoryType === 1 ? '搜索产品名称' : '搜索品牌名称'"
            />
            <button
              class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition"
              :disabled="loading"
              @click="handleSearch"
            >搜索</button>
            <button
              class="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              @click="keyword=''; handleSearch()"
            >重置</button>
          </div>
        </div>

        <!-- Sort Bar (PC) -->
        <div class="hidden lg:flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div class="flex space-x-6 text-sm">
            <button class="font-bold text-primary">综合排序</button>
            <button class="text-gray-600 hover:text-primary">销量</button>
            <button class="text-gray-600 hover:text-primary">价格</button>
          </div>
          <div class="text-sm text-gray-500">共 {{ products.length }} 件商品</div>
        </div>

        <!-- Product Grid -->
        <div v-if="loading" class="flex justify-center py-20 text-gray-500">加载中...</div>
        <div v-else-if="products.length === 0" class="flex justify-center py-20 text-gray-500">暂无产品</div>
        
        <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="item in products"
            :key="item.id"
            class="relative bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group cursor-pointer flex flex-col"
            :class="shopStatus === 0 ? 'opacity-70' : ''"
            @click="$router.push({ path: `/product/${item.id}`, query: { categoryId: activeCategoryId || undefined, type: categoryType } })"
          >
            <div
              v-if="shopStatus === 0"
              class="absolute top-2 left-2 z-10 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded"
            >
              敬请期待
            </div>
            <div class="aspect-square bg-gray-200 relative overflow-hidden">
               <img :src="getImageUrl(item.image)" class="object-cover w-full h-full group-hover:scale-105 transition duration-500" alt="Product">
            </div>
            <div class="p-4 flex-1 flex flex-col">
              <h3 class="font-bold text-gray-800 mb-1 leading-snug line-clamp-2">{{ item.name }}</h3>
              <p class="text-xs text-gray-500 mb-3 mt-auto line-clamp-1">{{ item.description || '暂无描述' }}</p>
              <div class="flex items-center justify-between mt-2">
                <div>
                    <span class="text-lg font-bold text-red-600">¥ {{ item.price }}</span>
                </div>
                <button 
                  class="w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm hover:shadow"
                  :class="shopStatus === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-600'"
                  :disabled="shopStatus === 0"
                  @click.stop="shopStatus === 0 ? ElMessage.warning('敬请期待，暂未开放购买') : handleAddToCart(item)"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="products.length > 0" class="mt-12 flex justify-center space-x-2">
            <button class="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm">上一页</button>
            <button class="px-4 py-2 bg-primary text-white rounded text-sm">1</button>
            <button class="px-4 py-2 border rounded hover:bg-gray-50 text-sm">2</button>
            <button class="px-4 py-2 border rounded hover:bg-gray-50 text-sm">下一页</button>
        </div>
      </main>
    </div>

    <!-- Mobile Filter Drawer -->
    <div v-if="showFilter" class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" @click="showFilter = false"></div>
      <div class="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-xl py-6 px-6 overflow-y-auto flex flex-col">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-lg font-bold">筛选产品</h2>
          <button @click="showFilter = false" class="-mr-2 w-10 h-10 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100">
            <span class="sr-only">Close menu</span>
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <!-- Mobile Filters Content -->
        <div class="flex-1 space-y-8">
             <div>
                <h3 class="font-bold text-gray-900 mb-3">分类</h3>
                <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="cat in categories" 
                      :key="cat.id" 
                      @click="handleCategoryClick(cat.id)"
                      class="px-3 py-1 rounded-full text-sm cursor-pointer transition"
                      :class="activeCategoryId === cat.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      {{ cat.name }}
                    </span>
                </div>
             </div>
        </div>
        
        <div class="mt-8 grid grid-cols-2 gap-4">
            <button class="py-3 border border-gray-300 rounded-lg text-gray-700 font-medium" @click="showFilter = false">重置</button>
            <button class="py-3 bg-primary text-white rounded-lg font-medium shadow-lg shadow-blue-200" @click="showFilter = false">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategoryList } from '@/api/category'
import { getDishList } from '@/api/product'
import { getSetmealList } from '@/api/setmeal'
import { getShopStatus } from '@/api/shop'
import { useCartStore } from '@/store/cart'
import { ElMessage } from 'element-plus'
import { getImageUrl } from '@/utils/image'

const showFilter = ref(false)
const categories = ref<any[]>([])
const products = ref<any[]>([])
const activeCategoryId = ref<number | null>(null)
const loading = ref(false)
const cartStore = useCartStore()
const categoryType = ref<1 | 2>(1) // 1 产品 2 品牌
const shopStatus = ref(1)
const keyword = ref('')
const route = useRoute()
const router = useRouter()

const handleAddToCart = async (item: any) => {
    if (shopStatus.value === 0) {
        ElMessage.warning('敬请期待，暂未开放购买')
        return
    }
    try {
        await cartStore.addToCart(item)
        ElMessage.success('已加入购物车')
    } catch (e) {
        console.error(e)
    }
}

// 获取分类
const initCategories = async () => {
    try {
        const res: any = await getCategoryList(categoryType.value) // 1=产品 2=品牌
        if (res && res.length > 0) {
            categories.value = [{ id: 0, name: categoryType.value === 1 ? '全部产品' : '全部品牌' }, ...res]
            activeCategoryId.value = 0 // 默认“全部”
            fetchProducts()
        }
    } catch (e) {
        console.error('Fetch categories failed:', e)
    }
}

// 获取商品
const fetchProducts = async () => {
    loading.value = true
    try {
        let res: any
        if (categoryType.value === 1) {
            res = await getDishList(activeCategoryId.value || undefined, keyword.value || undefined)
        } else {
            res = await getSetmealList(activeCategoryId.value || undefined, keyword.value || undefined)
        }
        if (res) {
            let list = res
            if (keyword.value) {
                const kw = keyword.value.toLowerCase()
                list = res.filter((item: any) => (item.name || '').toLowerCase().includes(kw) || (item.description || '').toLowerCase().includes(kw))
            }
            products.value = list
        }
    } catch (e) {
        console.error('Fetch products failed:', e)
    } finally {
        loading.value = false
    }
}

const handleCategoryClick = (id: number) => {
    activeCategoryId.value = id
    fetchProducts()
    showFilter.value = false 
}

const switchCategoryType = (type: 1 | 2) => {
    if (categoryType.value === type) return
    categoryType.value = type
    categories.value = []
    products.value = []
    activeCategoryId.value = null
    // 保留关键字，切换类型后继续搜索
    initCategories()
}

const initShopStatus = async () => {
    try {
        const status: any = await getShopStatus()
        shopStatus.value = Number(status ?? 1)
    } catch (e) {
        console.error('Fetch shop status failed:', e)
    }
}

onMounted(() => {
    // 初始化关键字（来自路由查询）
    if (route.query.keyword) {
        keyword.value = String(route.query.keyword)
    }
    initCategories()
    initShopStatus()
})

const handleSearch = () => {
    // 将关键字同步到路由，便于分享/刷新
    router.replace({ path: '/products', query: { ...route.query, keyword: keyword.value || undefined } })
    fetchProducts()
}

watch(() => route.query.keyword, (val) => {
    keyword.value = val ? String(val) : ''
})
</script>
