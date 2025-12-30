<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoryList } from '@/api/category'
import { getDishList } from '@/api/dish'
import { getSetmealList } from '@/api/setmeal'
import { getShopStatus } from '@/api/shop'
import { useCartStore } from '@/store/modules/cart'
import { showToast, showConfirmDialog } from 'vant'

import { getImageUrl } from '@/utils/image'

const router = useRouter()
const cartStore = useCartStore()

// 状态定义
const activeCategoryIndex = ref(0)
const categoryList = ref<any[]>([])
const productList = ref<any[]>([])
const loading = ref(false)
const shopStatus = ref(1) // 默认营业
const showCartDetail = ref(false) // 购物车详情弹窗

// 计算当前分类类型 (1菜品 2套餐)
const currentCategoryType = computed(() => {
  if (categoryList.value.length > 0 && categoryList.value[activeCategoryIndex.value]) {
    return categoryList.value[activeCategoryIndex.value].type
  }
  return 1
})

// 获取分类
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    categoryList.value = (res as any) || []
    if (categoryList.value.length > 0) {
      fetchProducts(categoryList.value[0])
    }
  } catch (error) {
    console.error(error)
  }
}

// 获取商品
const fetchProducts = async (category: any) => {
  loading.value = true
  productList.value = []
  try {
    let res
    if (category.type === 1) {
      res = await getDishList(category.id)
    } else {
      res = await getSetmealList(category.id)
    }
    productList.value = (res as any) || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const onCategoryChange = (index: number) => {
  const category = categoryList.value[index]
  if (category) {
    fetchProducts(category)
  }
}

// 加入购物车
const onAddCart = (item: any) => {
  if (shopStatus.value === 0) {
    showToast('店铺已打烊')
    return
  }

  // 构造购物车参数
  const params: any = {
    amount: item.price,
    name: item.name,
    image: getImageUrl(item.image),
  }

  if (currentCategoryType.value === 1) {
    // 菜品
    params.dishId = item.id
    // 如果有多口味，这里需要弹窗选择。这里简化处理：默认无口味或取第一个
    if (item.flavors && item.flavors.length > 0) {
      // 真实场景应弹窗。这里简化：
      const flavor = item.flavors[0]
      params.dishFlavor = flavor.value ? JSON.parse(flavor.value)[0] : ''
    }
  } else {
    // 套餐
    params.setmealId = item.id
  }

  cartStore.add(params)
  showToast({ message: '已加入', position: 'bottom' })
}

// 购物车操作
const onClearCart = () => {
  showConfirmDialog({
    title: '提示',
    message: '确认清空购物车吗？',
  }).then(() => {
    cartStore.clear()
    showCartDetail.value = false
  }).catch(() => {})
}

// 检查店铺状态
const checkStatus = async () => {
  try {
    const res = await getShopStatus()
    shopStatus.value = Number(res)
  } catch (e) {}
}

const toOrderSubmit = () => {
  router.push('/order/submit')
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  checkStatus()
  fetchCategories()
  cartStore.fetchCart() // 初始化购物车
})
</script>

<template>
  <div class="home-container">
    <van-nav-bar title="苍穹外卖" fixed placeholder z-index="10" />
    
    <van-notice-bar
      v-if="shopStatus === 0"
      color="#ed6a0c"
      background="#fffbe8"
      left-icon="info-o"
      text="店铺已打烊，暂时无法接单"
    />

    <div class="main-content">
      <div class="sidebar-wrapper">
        <van-sidebar v-model="activeCategoryIndex" @change="onCategoryChange">
          <van-sidebar-item 
            v-for="item in categoryList" 
            :key="item.id" 
            :title="item.name" 
          />
        </van-sidebar>
      </div>

      <div class="product-list-wrapper">
        <div v-if="loading" class="loading-box">
          <van-loading type="spinner" />
        </div>
        
        <div v-else class="product-list">
          <van-card
            v-for="item in productList"
            :key="item.id"
            :price="item.price.toFixed(2)"
            :desc="item.description || '暂无描述'"
            :title="item.name"
            :thumb="getImageUrl(item.image)"
          >
            <template #tags>
              <van-tag plain type="primary" v-if="item.flavors && item.flavors.length > 0">多口味</van-tag>
            </template>
            <template #footer>
              <van-button size="mini" round icon="plus" type="primary" @click="onAddCart(item)" />
            </template>
          </van-card>
          <van-empty v-if="!loading && productList.length === 0" description="该分类暂无商品" />
        </div>
      </div>
    </div>

    <!-- 悬浮购物车条 (覆盖在 Tabbar 上方) -->
    <div class="cart-bar" v-if="cartStore.totalNum > 0">
      <div class="cart-icon-wrapper" @click="showCartDetail = true">
        <div class="icon-box">
          <van-icon name="shopping-cart" size="24" color="#fff" />
          <div class="badge">{{ cartStore.totalNum }}</div>
        </div>
      </div>
      <div class="price-info" @click="showCartDetail = true">
        <span class="total">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
        <span class="delivery">免配送费</span>
      </div>
      <div class="submit-btn" @click="toOrderSubmit">
        去结算
      </div>
    </div>

    <!-- 购物车详情弹窗 -->
    <van-action-sheet v-model:show="showCartDetail" title="购物车" z-index="2000">
      <div class="cart-detail">
        <div class="cart-header">
          <span>已选商品</span>
          <span class="clear-btn" @click="onClearCart">
            <van-icon name="delete-o" /> 清空
          </span>
        </div>
        <div class="cart-items">
          <div class="cart-item" v-for="item in cartStore.cartList" :key="item.id">
            <div class="name">
              {{ item.name }}
              <span v-if="item.dishFlavor" class="flavor">({{ item.dishFlavor }})</span>
            </div>
            <div class="price">¥{{ item.amount }}</div>
            <div class="stepper">
              <van-stepper 
                v-model="item.number" 
                min="0" 
                theme="round" 
                button-size="22" 
                disable-input
                @change="(val) => { if(val === 0) cartStore.sub(item); else cartStore.add(item); }"
                @plus="cartStore.add(item)"
                @minus="cartStore.sub(item)"
              />
            </div>
          </div>
        </div>
      </div>
    </van-action-sheet>

    <van-tabbar route fixed placeholder z-index="9">
      <van-tabbar-item icon="home-o" to="/home">点餐</van-tabbar-item>
      <van-tabbar-item icon="orders-o" to="/orders">订单</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/me">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped lang="scss">
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  background-color: #f7f8fa;
  position: relative;
}

.sidebar-wrapper {
  width: 85px;
  overflow-y: auto;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}

.product-list-wrapper {
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
  padding-bottom: 80px; // 留出购物车条高度
}

.cart-bar {
  position: fixed;
  bottom: 50px; // Tabbar 高度
  left: 16px;
  right: 16px;
  height: 50px;
  background-color: #333;
  border-radius: 25px;
  display: flex;
  align-items: center;
  z-index: 100;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  padding-right: 2px; // 按钮边距

  .cart-icon-wrapper {
    position: relative;
    width: 50px;
    height: 50px;
    margin-top: -10px; // 突出显示
    margin-left: 0;
    
    .icon-box {
      width: 50px;
      height: 50px;
      background-color: #333;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 4px solid #f7f8fa; // 与背景同色，制造镂空感
      
      .badge {
        position: absolute;
        top: 0;
        right: 0;
        background-color: #ee0a24;
        color: #fff;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
      }
    }
  }

  .price-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 10px;
    color: #fff;
    
    .total {
      font-size: 18px;
      font-weight: bold;
    }
    .delivery {
      font-size: 10px;
      color: #999;
    }
  }

  .submit-btn {
    width: 100px;
    height: 46px;
    background-color: #ffc200; // 美团黄 / 橙色
    color: #333;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0 25px 25px 0;
    font-size: 14px;
  }
}

.cart-detail {
  padding-bottom: 20px;
  
  .cart-header {
    display: flex;
    justify-content: space-between;
    padding: 10px 16px;
    background-color: #f7f8fa;
    font-size: 14px;
    color: #666;
    
    .clear-btn {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  
  .cart-items {
    max-height: 300px;
    overflow-y: auto;
    padding: 0 16px;
  }
  
  .cart-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #eee;
    
    .name {
      flex: 1;
      font-size: 14px;
      color: #333;
      .flavor {
        font-size: 12px;
        color: #999;
        margin-left: 4px;
      }
    }
    
    .price {
      width: 60px;
      font-weight: bold;
      color: #ee0a24;
      text-align: right;
      margin-right: 16px;
    }
    
    .stepper {
      // 
    }
  }
}

:deep(.van-card) {
  background-color: #fff;
  margin-top: 0;
  border-bottom: 1px solid #eee;
}
</style>