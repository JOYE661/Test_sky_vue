import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { listCart, addCart, subCart, cleanCart } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const cartList = ref<any[]>([])
  const loading = ref(false)

  // 购物车总数量 (用于 Header 角标)
  const totalCount = computed(() => {
    return cartList.value.reduce((sum, item) => sum + item.number, 0)
  })

  // 购物车总金额
  const totalPrice = computed(() => {
    return cartList.value.reduce((sum, item) => sum + (item.amount * item.number), 0)
  })

  // 从后端同步购物车数据
  const fetchCart = async () => {
    if (!localStorage.getItem('token')) return
    loading.value = true
    try {
      const res: any = await listCart()
      if (res) {
        cartList.value = res
      }
    } catch (e) {
      console.error('Fetch cart failed:', e)
    } finally {
      loading.value = false
    }
  }

  // 添加商品到购物车
  const addToCart = async (product: any) => {
    try {
      // 后端参数需要 dishId 或 setmealId
      const params: any = {
        dishFlavor: product.selectedFlavor || '' // 选中的口味
      }
      if (product.setmealId || product.categoryType === 2 || product.type === 2 || product.isSetmeal) {
        params.setmealId = product.setmealId || product.id
      } else {
        params.dishId = product.dishId || product.id
      }
      await addCart(params)
      await fetchCart() // 操作成功后刷新列表
    } catch (e) {
      console.error('Add to cart failed:', e)
    }
  }

  // 减少商品数量
  const minusFromCart = async (product: any) => {
    try {
      const params: any = {
        dishId: product.dishId,
        setmealId: product.setmealId
      }
      if (!params.dishId && !params.setmealId) {
        params.dishId = product.id
      }
      await subCart(params)
      await fetchCart()
    } catch (e) {
      console.error('Sub from cart failed:', e)
    }
  }

  // 清空购物车
  const clearAll = async () => {
    try {
      await cleanCart()
      cartList.value = []
    } catch (e) {
      console.error('Clear cart failed:', e)
    }
  }

  return { 
    cartList, 
    loading, 
    totalCount, 
    totalPrice, 
    fetchCart, 
    addToCart, 
    minusFromCart, 
    clearAll 
  }
})
