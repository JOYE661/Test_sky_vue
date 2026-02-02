<template>
  <div class="bg-white min-h-screen pb-20 text-gray-900 font-sans">
    <div v-if="!product.id" class="flex justify-center items-center h-screen text-gray-400">
        加载中...
    </div>
    <div v-else class="container mx-auto px-4 pt-4 lg:pt-8">
      <!-- Breadcrumb -->
      <nav class="flex text-sm text-gray-500 mb-6 space-x-2">
        <router-link to="/" class="hover:text-primary transition">首页</router-link>
        <span>/</span>
        <router-link to="/products" class="hover:text-primary transition">全部商品</router-link>
        <span>/</span>
        <span class="text-gray-900 font-medium">{{ product.name || '商品详情' }}</span>
      </nav>

      <!-- Main Product Area -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
        <!-- Left: Gallery -->
        <div class="space-y-4">
          <div class="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative group border border-gray-100">
             <img :src="getImageUrl(currentImage)" class="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt="Product Image">
             <div v-if="product.status === 1" class="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">现货充足</div>
          </div>
          <!-- Thumbnails -->
          <div class="grid grid-cols-5 gap-3" v-if="images.length > 1">
             <div 
                v-for="(img, idx) in images" 
                :key="idx" 
                class="aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200"
                :class="currentImage === img ? 'border-primary ring-2 ring-blue-100' : 'border-transparent hover:border-gray-300'"
                @click="currentImage = img"
             >
                <img :src="getImageUrl(img)" class="w-full h-full object-cover">
             </div>
          </div>
        </div>

        <!-- Right: Info -->
        <div class="flex flex-col">
           <div class="mb-4">
               <span class="text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded mr-2">SOMAGO 自营</span>
               <span class="text-gray-400 text-sm">编号: {{ product.id }}</span>
           </div>
           <h1 class="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">{{ product.name }}</h1>
           
           <!-- Price Box -->
           <div class="bg-gray-50 rounded-2xl p-8 mb-8 border border-gray-100 flex items-center justify-between gap-6">
              <div>
                <div class="flex items-baseline mb-4">
                   <span class="text-gray-500 text-sm mr-2">批发价</span>
                   <span class="text-4xl font-black text-red-600">¥ {{ product.price }}</span>
                   <span class="text-gray-400 text-sm ml-2">/ 份</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="flex items-center text-gray-600">
                        <span class="w-16">起订量</span>
                        <span class="font-bold text-gray-900">1 份起订</span>
                    </div>
                    <div class="flex items-center text-gray-600">
                        <span class="w-16">物流</span>
                        <span class="font-bold text-green-600">极速冷链 (免运费)</span>
                    </div>
                </div>
              </div>
              <div v-if="shopStatus === 0" class="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                 敬请期待
              </div>
           </div>

           <!-- SKU Selection (Flavors) -->
           <div class="space-y-8 mb-10 flex-1" v-if="!isBrand && product.flavors && product.flavors.length > 0">
              <div v-for="flavor in product.flavors" :key="flavor.name">
                 <h3 class="font-bold text-gray-900 mb-4 flex items-center">
                     选择{{ flavor.name }}
                     <span class="ml-2 text-xs font-normal text-gray-400">(必选)</span>
                 </h3>
                 <div class="flex flex-wrap gap-3">
                    <button 
                        v-for="val in parseFlavorValue(flavor.value)" 
                        :key="val"
                        class="px-8 py-2.5 border-2 rounded-xl transition-all duration-200 text-sm font-medium"
                        :class="selectedFlavors[flavor.name] === val 
                            ? 'border-primary text-primary bg-blue-50 ring-2 ring-blue-100' 
                            : 'border-gray-100 text-gray-600 hover:border-gray-300 bg-white'"
                        @click="selectedFlavors[flavor.name] = val"
                    >
                        {{ val }}
                    </button>
                 </div>
              </div>
           </div>

           <!-- Quantity & Action -->
           <div class="space-y-6 pt-6 border-t border-gray-100">
                 <h3 class="font-bold text-gray-900">订购数量</h3>
                 <div class="flex items-center space-x-6">
                    <div class="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-12">
                        <button class="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition active:bg-gray-200" @click="quantity > 1 ? quantity-- : null">-</button>
                        <input type="number" v-model="quantity" class="w-16 h-full text-center text-lg font-bold text-gray-900 focus:outline-none bg-transparent">
                        <button class="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition active:bg-gray-200" @click="quantity++">+</button>
                    </div>
                    <span class="text-gray-400">当前总价: <span class="text-red-600 font-bold">¥ {{ (product.price * quantity).toFixed(2) }}</span></span>
                 </div>

                 <div class="flex space-x-4 pt-4">
                    <button 
                        class="flex-1 bg-white border-2 border-primary text-primary font-bold py-4 rounded-xl transition-all text-lg shadow-sm active:scale-95"
                        :class="shopStatus === 0 ? 'opacity-60 border-gray-200 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50'"
                        :disabled="shopStatus === 0"
                        @click="shopStatus === 0 ? ElMessage.warning('敬请期待，暂未开放购买') : (isBrand ? handleAddBrandBundle() : handleAddToCart())"
                    >
                        {{ isBrand ? '加入品牌组合' : '加入购物车' }}
                    </button>
                    <button
                      class="flex-1 bg-primary text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-100 text-lg active:scale-95"
                      :class="shopStatus === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'hover:bg-blue-600'"
                      :disabled="shopStatus === 0"
                      @click="shopStatus === 0 ? ElMessage.warning('敬请期待，暂未开放购买') : handleBuyNow()"
                    >
                        立即订货
                    </button>
                 </div>
           </div>
        </div>
      </div>

      <!-- Brand Items -->
      <div v-if="isBrand" class="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
         <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">品牌组合清单</h3>
            <button
              class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition"
              :disabled="shopStatus === 0"
              @click="shopStatus === 0 ? ElMessage.warning('敬请期待，暂未开放购买') : handleAddBrandBundle()"
            >
              一键加购整套
            </button>
         </div>
         <div v-if="brandItems.length === 0" class="text-sm text-gray-500">暂无组合明细</div>
         <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="item in brandItems" :key="item.id" class="flex items-center bg-gray-50 rounded-xl p-3">
               <img :src="getImageUrl(item.image)" class="w-16 h-16 rounded-lg object-cover mr-3" alt="">
               <div class="flex-1">
                  <div class="font-semibold text-gray-900">{{ item.name }}</div>
                  <div class="text-xs text-gray-500 mt-1">x {{ item.copies || item.number || 1 }}</div>
               </div>
               <div class="text-sm font-bold text-red-600">¥ {{ item.price || item.amount || '--' }}</div>
            </div>
         </div>
      </div>

      <!-- Detail Tabs -->
      <div class="border-t border-gray-200 pt-12">
         <div class="flex space-x-12 border-b border-gray-100 mb-10 overflow-x-auto pb-px">
            <button 
                v-for="tab in ['商品详情', '规格参数', '售后保障']" :key="tab"
                class="pb-4 text-lg transition-all relative"
                :class="activeTab === tab ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-600'"
                @click="activeTab = tab"
            >
                {{ tab }}
                <div v-if="activeTab === tab" class="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"></div>
            </button>
         </div>
         
         <div class="min-h-[400px]">
            <div v-if="activeTab === '商品详情'" class="prose max-w-none text-gray-600 animate-fade-in">
                <p class="text-lg leading-relaxed mb-8">{{ product.description || '暂无详细描述' }}</p>
                <div class="space-y-4">
                    <img v-for="i in 3" :key="i" :src="getImageUrl(product.image)" class="w-full rounded-2xl shadow-sm border border-gray-100">
                </div>
            </div>
            <div v-if="activeTab === '规格参数'" class="bg-gray-50 rounded-2xl p-8 animate-fade-in">
                <table class="w-full text-sm text-gray-600">
                    <tbody>
                        <tr class="border-b border-gray-200"><td class="py-4 font-bold w-32">商品名称</td><td class="py-4">{{ product.name }}</td></tr>
                        <tr class="border-b border-gray-200"><td class="py-4 font-bold">商品编号</td><td class="py-4">{{ product.id }}</td></tr>
                        <tr class="border-b border-gray-200"><td class="py-4 font-bold">所属分类</td><td class="py-4">{{ product.categoryName }}</td></tr>
                        <tr><td class="py-4 font-bold">存储方式</td><td class="py-4">冷链存储 (-18℃)</td></tr>
                    </tbody>
                </table>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail, getDishList } from '@/api/product'
import { getSetmealList, getSetmealDishes } from '@/api/setmeal'
import { getShopStatus } from '@/api/shop'
import { useCartStore } from '@/store/cart'
import { ElMessage } from 'element-plus'
import { getImageUrl } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const quantity = ref(1)
const product = ref<any>({})
const currentImage = ref('')
const images = ref<string[]>([])
const activeTab = ref('商品详情')
const shopStatus = ref(1)
const isBrand = ref(false)
const brandItems = ref<any[]>([])

// 存储选中的多个规格，例如 { "温度": "常温", "包装": "大箱" }
const selectedFlavors = reactive<Record<string, string>>({})

const parseFlavorValue = (val: any) => {
  try {
    return typeof val === 'string' ? JSON.parse(val) : val
  } catch (e) {
    return []
  }
}

const handleAddToCart = async () => {
  if (shopStatus.value === 0) {
    ElMessage.warning('敬请期待，暂未开放购买')
    return
  }
  if (!product.value.id) return

  if (!isBrand.value) {
    const unselected = product.value.flavors?.filter((f: any) => !selectedFlavors[f.name])
    if (unselected && unselected.length > 0) {
      ElMessage.warning(`请选择${unselected[0].name}`)
      return
    }
  }
  const flavorStr = Object.values(selectedFlavors).join(',')

  try {
    for (let i = 0; i < quantity.value; i++) {
      await cartStore.addToCart({
        id: product.value.id,
        dishId: isBrand.value ? undefined : (product.value.dishId || product.value.id),
        setmealId: isBrand.value ? product.value.id : product.value.setmealId,
        selectedFlavor: isBrand.value ? '' : flavorStr,
        categoryType: isBrand.value ? 2 : (product.value.categoryType || (product.value.setmealId ? 2 : 1))
      })
    }
    ElMessage.success({
      message: '已成功加入购物车',
      type: 'success',
      duration: 1500
    })
  } catch (e) {
    ElMessage.error('加购失败')
  }
}

const handleBuyNow = async () => {
  if (shopStatus.value === 0) {
    ElMessage.warning('敬请期待，暂未开放购买')
    return
  }
  if (!product.value.id) return

  if (!isBrand.value) {
    const unselected = product.value.flavors?.filter((f: any) => !selectedFlavors[f.name])
    if (unselected && unselected.length > 0) {
      ElMessage.warning(`请选择${unselected[0].name}`)
      return
    }
  }
  const flavorStr = Object.values(selectedFlavors).join(',')

  try {
    for (let i = 0; i < quantity.value; i++) {
      await cartStore.addToCart({
        id: product.value.id,
        dishId: isBrand.value ? undefined : (product.value.dishId || product.value.id),
        setmealId: isBrand.value ? product.value.id : product.value.setmealId,
        selectedFlavor: isBrand.value ? '' : flavorStr,
        categoryType: isBrand.value ? 2 : (product.value.categoryType || (product.value.setmealId ? 2 : 1))
      })
    }
    router.push('/order/create')
  } catch (e) {
    ElMessage.error('下单前加购失败')
  }
}

const handleAddBrandBundle = async () => {
  if (shopStatus.value === 0) {
    ElMessage.warning('敬请期待，暂未开放购买')
    return
  }
  if (!product.value.id) return
  try {
    for (let i = 0; i < quantity.value; i++) {
      await cartStore.addToCart({
        id: product.value.id,
        setmealId: product.value.id,
        categoryType: 2
      })
    }
    ElMessage.success('已加入品牌组合')
  } catch (e) {
    ElMessage.error('加购失败')
  }
}

const initData = async () => {
  const id = route.params.id as string
  if (!id) return
  const rawCategoryId = route.query.categoryId as string | undefined
  const categoryId = rawCategoryId ? Number(rawCategoryId) : undefined
  const type = Number(route.query.type || 1)
  isBrand.value = type === 2
  try {
    const res: any = await getProductDetail(id)
    if (res) {
      product.value = res
      currentImage.value = res.image
      images.value = [res.image]
      res.flavors?.forEach((f: any) => {
        const values = parseFlavorValue(f.value)
        if (values && values.length === 1) {
          selectedFlavors[f.name] = values[0]
        }
      })
      if (isBrand.value) {
        try {
          const list: any = await getSetmealDishes(res.id)
          brandItems.value = list || []
        } catch (e) {
          console.error('Fetch brand items failed', e)
        }
      }
      return
    }
  } catch (e) {
    console.warn('Detail API not available, fallback to list query')
  }

  // Fallback：根据分类列表查询再匹配
  try {
    const list: any = type === 2
      ? await getSetmealList(categoryId)
      : await getDishList(categoryId)
    const found = list?.find((item: any) => item.id.toString() === id)
    if (found) {
      product.value = found
      currentImage.value = found.image
      images.value = [found.image]
      found.flavors?.forEach((f: any) => {
        const values = parseFlavorValue(f.value)
        if (values && values.length === 1) {
          selectedFlavors[f.name] = values[0]
        }
      })
      if (isBrand.value) {
        try {
          const list: any = await getSetmealDishes(found.id)
          brandItems.value = list || []
        } catch (e) {
          console.error('Fetch brand items failed', e)
        }
      }
    } else {
      ElMessage.error('未找到该产品')
    }
  } catch (e) {
    console.error('Fallback query failed', e)
  }
}

const initShopStatus = async () => {
  try {
    const status: any = await getShopStatus()
    shopStatus.value = Number(status ?? 1)
  } catch (e) {
    console.error('Fetch shop status failed', e)
  }
}

onMounted(() => {
  initData()
  initShopStatus()
})
</script>

<style scoped>
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
}
/* 隐藏 Chrome 等浏览器的数字输入框箭头 */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
