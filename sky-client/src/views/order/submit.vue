<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/store/modules/cart'
import { getDefaultAddress, getAddressById } from '@/api/address'
import { submitOrder, payOrder } from '@/api/order'
import { showToast, showLoadingToast } from 'vant'
import { getImageUrl } from '@/utils/image'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const address = ref<any>(null)
const remark = ref('')
const deliveryFee = 6 // 配送费固定
const packFee = 0 // 打包费暂定0

// 选中的地址ID
const chosenAddressId = route.query.addressId

// 加载地址
const loadAddress = async () => {
  try {
    if (chosenAddressId) {
      const res = await getAddressById(Number(chosenAddressId))
      address.value = res
    } else {
      const res = await getDefaultAddress()
      address.value = res || null // 没默认地址
    }
  } catch (error) {
    console.error(error)
  }
}

// 计算费用
const totalAmount = computed(() => {
  return cartStore.totalPrice + deliveryFee + packFee
})

// 选择地址
const onSelectAddress = () => {
  router.push('/address?from=order')
}

// 提交订单
const onSubmit = async () => {
  if (!address.value) {
    showToast('请选择收货地址')
    return
  }
  if (cartStore.cartList.length === 0) {
    showToast('购物车为空')
    return
  }

  const loadingToast = showLoadingToast({
    message: '正在下单...',
    forbidClick: true,
    duration: 0
  })

  try {
    const orderData = {
      addressBookId: address.value.id,
      amount: totalAmount.value,
      packAmount: packFee,
      payMethod: 1, // 微信支付
      remark: remark.value,
      status: 1, // 待付款
      tablewareNumber: 1,
      tablewareStatus: 1,
      deliveryStatus: 1, // 立即送出
      estimatedDeliveryTime: new Date(Date.now() + 3600000).toISOString().replace('T', ' ').substring(0, 19) // 预计1小时后
    }

    const res: any = await submitOrder(orderData)
    // res 是 orderSubmitVO
    
    // 下单成功，关闭 loading
    loadingToast.close()
    
    // 清空购物车
    cartStore.clear()

    // 模拟支付
    await mockPay(res.orderNumber)
    
  } catch (error) {
    loadingToast.close()
    console.error(error)
  }
}

// 模拟支付流程
const mockPay = async (orderNumber: string) => {
    // 真实流程：调用 payOrder 获取微信支付参数 -> 唤起微信支付
    // 这里我们直接调用 payOrder，后端如果没配置真实商户号可能会报错。
    try {
        await payOrder({ orderNumber, payMethod: 1 })
        showToast({ type: 'success', message: '支付成功' })
    } catch (e) {
        console.warn('支付接口报错(预期内):', e)
        // 模拟成功
        showToast({ type: 'success', message: '支付成功(模拟)' })
    }
    
    // 延迟跳转
    setTimeout(() => {
        router.replace('/orders')
    }, 1000)
}

onMounted(() => {
  loadAddress()
  if (cartStore.cartList.length === 0) {
    cartStore.fetchCart()
  }
})
</script>

<template>
  <div class="order-submit-container">
    <van-nav-bar title="提交订单" left-arrow @click-left="router.back()" />
    
    <!-- 地址栏 -->
    <div class="address-card" @click="onSelectAddress">
      <div v-if="address" class="address-info">
        <div class="user">
          <span class="name">{{ address.consignee }}</span>
          <span class="tel">{{ address.sex === '1' ? '先生' : '女士' }} {{ address.phone }}</span>
        </div>
        <div class="detail">{{ address.provinceName }}{{ address.cityName }}{{ address.districtName }}{{ address.detail }}</div>
      </div>
      <div v-else class="no-address">
        <van-icon name="add" color="#1989fa" /> 请选择收货地址
      </div>
      <van-icon name="arrow" color="#999" />
    </div>

    <!-- 订单明细 -->
    <div class="order-card">
      <div class="shop-name">苍穹外卖</div>
      <div class="goods-list">
        <div class="goods-item" v-for="item in cartStore.cartList" :key="item.id">
          <van-image :src="getImageUrl(item.image)" width="50" height="50" radius="4" />
          <div class="info">
            <div class="name">{{ item.name }}</div>
            <div class="desc">{{ item.dishFlavor }}</div>
          </div>
          <div class="num">x{{ item.number }}</div>
          <div class="price">¥{{ item.amount }}</div>
        </div>
      </div>
      <div class="fee-item">
        <span>打包费</span>
        <span>¥{{ packFee }}</span>
      </div>
      <div class="fee-item">
        <span>配送费</span>
        <span>¥{{ deliveryFee }}</span>
      </div>
      <div class="total-line">
        <span class="label">小计</span>
        <span class="price">¥<span class="big">{{ totalAmount }}</span></span>
      </div>
    </div>

    <!-- 备注 -->
    <div class="remark-card">
      <van-field
        v-model="remark"
        label="备注"
        placeholder="建议留言前先与商家沟通确认"
        input-align="right"
      />
      <van-cell title="餐具数量" value="无需餐具" is-link />
      <van-cell title="支付方式" value="在线支付" />
    </div>

    <!-- 底部提交栏 -->
    <van-submit-bar 
      :price="totalAmount * 100" 
      button-text="去支付" 
      @submit="onSubmit" 
    />
  </div>
</template>

<style scoped lang="scss">
.order-submit-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}

.address-card {
  margin: 10px;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .address-info {
    flex: 1;
    .user {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 5px;
      .tel {
        font-weight: normal;
        font-size: 14px;
        color: #666;
        margin-left: 8px;
      }
    }
    .detail {
      font-size: 14px;
      color: #333;
      line-height: 1.4;
    }
  }
  
  .no-address {
    flex: 1;
    font-size: 16px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

.order-card, .remark-card {
  margin: 10px;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
}

.shop-name {
  font-weight: bold;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.goods-item {
  display: flex;
  margin-bottom: 15px;
  .info {
    flex: 1;
    margin-left: 10px;
    .name { font-size: 14px; color: #333; }
    .desc { font-size: 12px; color: #999; margin-top: 4px; }
  }
  .num { width: 30px; text-align: right; color: #333; }
  .price { width: 60px; text-align: right; font-weight: bold; }
}

.fee-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
}

.total-line {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  border-top: 1px solid #eee;
  padding-top: 10px;
  margin-top: 10px;
  .label { font-size: 14px; margin-right: 5px; }
  .price { color: #ee0a24; font-size: 14px; font-weight: bold; }
  .big { font-size: 20px; }
}
</style>
