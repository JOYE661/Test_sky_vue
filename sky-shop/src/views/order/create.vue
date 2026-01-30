<template>
  <div class="bg-gray-50 min-h-screen py-8 pb-24 text-gray-900 font-sans">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-2xl font-bold mb-6">确认订单</h1>
      <div v-if="shopStatus === 0" class="mb-4 p-4 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-100">
        敬请期待：商城暂未开放购买，当前无法下单。
      </div>
      
      <!-- 1. 收货地址区 -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold">收货地址</h3>
              <button class="text-blue-600 text-sm hover:underline" @click="showAddressList = true">修改地址</button>
          </div>
          
          <div v-if="address" class="flex items-center p-4 border border-blue-100 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition" @click="showAddressList = true">
              <div class="flex-1">
                  <div class="font-bold text-lg">
                      {{ address.consignee }} <span class="text-gray-500 font-normal ml-2 text-base">{{ address.phone }}</span>
                  </div>
                  <div class="text-gray-600 mt-1">{{ address.provinceName }}{{ address.cityName }}{{ address.districtName }}{{ address.detail }}</div>
              </div>
              <el-icon class="text-gray-400"><ArrowRight /></el-icon>
          </div>
          
          <div v-else @click="showAddressList = true" class="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 text-gray-500 transition">
              + 请选择收货地址
          </div>
      </div>
      
      <!-- 2. 支付方式 -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 class="font-bold mb-4">支付方式</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
              <div 
                v-for="m in payMethods" :key="m.id"
                @click="payMethod = m.id"
                class="p-4 border rounded-xl cursor-pointer transition"
                :class="payMethod === m.id ? 'border-blue-500 bg-blue-50 text-blue-600 font-bold' : 'border-gray-200 text-gray-600 hover:border-blue-300'"
              >
                <span class="mr-2">{{ m.icon }}</span>
                <span>{{ m.name }}</span>
              </div>
          </div>
      </div>

      <!-- 3. 商品清单 & 费用明细 -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 class="font-bold mb-4 border-b pb-4">商品清单</h3>
          <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-4">
              <div v-for="item in cartStore.cartList" :key="item.id" class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div class="flex items-center">
                      <img :src="getImageUrl(item.image)" class="w-16 h-16 object-cover rounded-lg border border-gray-100 mr-4">
                      <div>
                          <div class="font-bold text-gray-800">{{ item.name }}</div>
                          <div class="text-xs text-gray-400 mt-1">{{ item.dishFlavor || '标准规格' }}</div>
                      </div>
                  </div>
                  <div class="text-right">
                      <div class="text-sm text-gray-500">x {{ item.number }}</div>
                      <div class="font-bold text-gray-900 mt-1">¥ {{ (item.amount * item.number).toFixed(2) }}</div>
                  </div>
              </div>
          </div>
          
          <div v-if="cartStore.cartList.length === 0" class="text-center py-10 text-gray-400">
              暂无选购商品
          </div>

          <!-- 费用明细 -->
          <div class="space-y-3 pt-4 border-t border-gray-100 text-sm">
              <div class="flex justify-between text-gray-600">
                  <span>商品合计</span>
                  <span class="font-bold">¥ {{ cartStore.totalPrice.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                  <span>冷链包装费</span>
                  <span class="font-bold">¥ {{ coldChainFee.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                  <span>运费（基于重量/地区）</span>
                  <span class="font-bold" :class="shippingFee === 0 ? 'text-green-600' : ''">¥ {{ shippingFee.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                  <span>税费（含6%增值税）</span>
                  <span class="font-bold">¥ {{ taxAmount.toFixed(2) }}</span>
              </div>
              <div class="text-xs text-gray-500 flex flex-col gap-1">
                  <span>运费公式：基础 ¥{{ baseShipping.toFixed(0) }} + 重量附加 ¥{{ weightSurcharge.toFixed(0) }}/kg，满 ¥{{ freeShippingThreshold.toFixed(0) }} 包邮。</span>
                  <span v-if="needInvoice" class="text-blue-500">已选择开票，将以含税价结算。</span>
              </div>
          </div>
      </div>

      <!-- 4. 其他设置 -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-6">
          <div class="flex items-center justify-between">
              <div>
                  <h3 class="font-bold mb-2">需要发票</h3>
                  <p class="text-xs text-gray-500">默认含税价，如需纸票/电票，请勾选后备注抬头与税号。</p>
              </div>
              <el-switch v-model="needInvoice" />
          </div>
          
          <div class="space-y-2">
              <h3 class="font-bold mb-2">订单备注</h3>
              <el-input 
                v-model="remark" 
                type="textarea" 
                :rows="3" 
                placeholder="写下装卸要求、预约时间或发票信息"
                maxlength="120"
                show-word-limit
              />
          </div>
      </div>

      <!-- 5. 底部固定结算栏 -->
      <div class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[999]">
          <div class="container mx-auto px-4 max-w-4xl h-20 flex justify-between items-center text-gray-900">
              <div>
                  <span class="text-gray-500">应付总额（含税）：</span>
                  <span class="text-2xl font-bold text-red-600">¥ {{ finalTotalPrice.toFixed(2) }}</span>
              </div>
              <button 
                @click="handleSubmit"
                class="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-100 disabled:bg-gray-300 disabled:cursor-not-allowed"
                :class="shopStatus === 0 ? 'bg-gray-200 text-gray-500 shadow-none' : 'hover:bg-blue-700'"
                :disabled="loading || cartStore.cartList.length === 0 || shopStatus === 0"
              >
                {{ shopStatus === 0 ? '敬请期待' : (loading ? '锁定库存...' : '提交并锁库存') }}
              </button>
          </div>
      </div>
    </div>

    <!-- 地址选择弹窗 -->
    <el-dialog title="选择收货地址" v-model="showAddressList" width="550px">
        <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            <div 
                v-for="addr in allAddresses" 
                :key="addr.id" 
                @click="selectAddress(addr)" 
                class="p-4 border rounded-xl cursor-pointer transition hover:border-blue-400"
                :class="address?.id === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100'"
            >
                <div class="font-bold text-gray-900">{{ addr.consignee }} <span class="font-normal text-gray-500 ml-2">{{ addr.phone }}</span></div>
                <div class="text-sm text-gray-600 mt-1">{{ addr.provinceName }}{{ addr.cityName }}{{ addr.districtName }}{{ addr.detail }}</div>
            </div>
            <div v-if="allAddresses.length === 0" class="text-center py-10 text-gray-400">
                暂无地址，请前往个人中心添加
            </div>
        </div>
        <template #footer>
            <div class="flex justify-between w-full">
                <el-button @click="router.push('/address')">管理地址</el-button>
                <el-button type="primary" @click="showAddressList = false">关闭</el-button>
            </div>
        </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart'
import { getDefaultAddress, listAddress } from '@/api/address'
import { submitOrder, payOrder } from '@/api/order'
import { ElMessage } from 'element-plus'
import { getImageUrl } from '@/utils/image'
import { ArrowRight } from '@element-plus/icons-vue'
import { getShopStatus } from '@/api/shop'

const router = useRouter()
const cartStore = useCartStore()
const address = ref<any>(null)
const allAddresses = ref<any[]>([])
const showAddressList = ref(false)
const loading = ref(false)
const payMethod = ref(1) 

const coldChainFee = ref(5) // 冷链/仓配处理费
const baseShipping = ref(8)
const weightSurcharge = ref(2) // 每 kg 附加
const freeShippingThreshold = ref(199)
const estimatedWeight = computed(() => Math.max(cartStore.totalPrice / 30, 1)) // 简化估重：¥30≈1kg
const shippingFee = computed(() => {
    if (cartStore.totalPrice >= freeShippingThreshold.value) return 0
    return baseShipping.value + estimatedWeight.value * weightSurcharge.value
})
const taxRate = ref(0.06)
const needInvoice = ref(false)
const remark = ref('')
const shopStatus = ref(1)

const taxAmount = computed(() => {
    return cartStore.totalPrice * taxRate.value
})

const finalTotalPrice = computed(() => {
    return cartStore.totalPrice + coldChainFee.value + shippingFee.value + taxAmount.value
})

const payMethods = [
    { id: 1, name: '微信支付', icon: '💬' },
    { id: 2, name: '支付宝', icon: '💳' },
    { id: 3, name: '银行卡', icon: '🏦' }
]

const initData = async () => {
    try {
        const res1: any = await getDefaultAddress()
        if (res1) address.value = res1
        const res2: any = await listAddress()
        if (res2) allAddresses.value = res2
    } catch (e) { 
        console.error('Init checkout data failed', e) 
    }
}

const selectAddress = (addr: any) => {
    address.value = addr
    showAddressList.value = false
}

const handleSubmit = async () => {
    if (shopStatus.value === 0) {
        ElMessage.warning('敬请期待，暂未开放购买')
        return
    }
    if (!address.value) {
        ElMessage.warning('请选择收货地址')
        return
    }
    
    loading.value = true
    try {
        const res: any = await submitOrder({
            addressBookId: address.value.id,
            amount: finalTotalPrice.value,
            payMethod: payMethod.value,
            deliveryStatus: 1,
            remark: remark.value + (needInvoice.value ? ' | 需发票' : ''),
            packAmount: coldChainFee.value,
            tablewareNumber: 0,
            tablewareStatus: 0,
            estimatedDeliveryTime: new Date(Date.now() + 3600000).toISOString().replace('T', ' ').substring(0, 19)
        })
        
        if (res && res.orderNumber) {
            try {
                await payOrder({ 
                    orderNumber: res.orderNumber, 
                    payMethod: payMethod.value 
                })
                ElMessage.success('订单提交并支付成功')
            } catch (payError) {
                console.warn('Payment API Error:', payError)
                ElMessage.success('订单提交成功 (模拟支付)')
            }
            
            cartStore.clearAll()
            setTimeout(() => { 
                router.push('/order') 
            }, 1000)
        }
    } catch (e: any) {
        console.error('Checkout failed', e)
        ElMessage.error(e.message || '下单失败')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    if (cartStore.cartList.length === 0) {
        cartStore.fetchCart()
    }
    initData()
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
</script>
