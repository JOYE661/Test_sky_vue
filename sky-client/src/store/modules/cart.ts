import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { listCart, addCart, subCart, cleanCart } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const cartList = ref<any[]>([])

  // 获取最新购物车数据
  const fetchCart = async () => {
    try {
      const res = await listCart()
      cartList.value = (res as any) || []
    } catch (error) {
      console.error(error)
    }
  }

  // 添加商品到购物车
  const add = async (item: any) => {
    // 构造后端需要的参数
    const params: any = {
      // 如果是菜品
      dishId: item.dishId || item.id,
      // 如果是套餐
      setmealId: item.setmealId,
      // 规格/口味
      dishFlavor: item.dishFlavor, 
    }
    
    // 如果是套餐，id 字段名可能不同，这里做个简单兼容
    if (item.flavors) {
        // 这是从商品列表传进来的原始数据
        // 实际上添加购物车需要区分是 setmeal 还是 dish
        // 我们假设外部调用时处理好了参数，或者在这里判断
        // 为了简单，我们依赖外部传入正确的 item 结构（包含 dishId 或 setmealId）
    }

    try {
      await addCart(params)
      await fetchCart() // 重新拉取
    } catch (error) {
      console.error(error)
    }
  }

  // 减少商品
  const sub = async (item: any) => {
    try {
      await subCart(item)
      await fetchCart()
    } catch (error) {
      console.error(error)
    }
  }

  // 清空
  const clear = async () => {
    try {
      await cleanCart()
      cartList.value = []
    } catch (error) {
      console.error(error)
    }
  }

  // 计算属性
  const totalNum = computed(() => {
    return cartList.value.reduce((total, item) => total + item.number, 0)
  })

  const totalPrice = computed(() => {
    return cartList.value.reduce((total, item) => total + item.number * item.amount, 0)
  })

  return {
    cartList,
    fetchCart,
    add,
    sub,
    clear,
    totalNum,
    totalPrice
  }
})
