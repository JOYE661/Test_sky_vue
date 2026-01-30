<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <el-button text @click="router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h1 class="text-2xl font-bold text-gray-900">订单详情</h1>
        </div>
        <span class="text-sm text-gray-500">单号：{{ detail.number }}</span>
      </div>

      <el-card shadow="never" class="mb-4">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="font-bold text-gray-800">订单状态</div>
            <span :class="statusClass(detail.status)" class="font-semibold">
              {{ statusText(detail.status) }}
            </span>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>下单时间：{{ detail.orderTime || '-' }}</div>
          <div>支付方式：{{ payMethodText(detail.payMethod) }}</div>
          <div>配送地址：{{ detail.address || '-' }}</div>
          <div>收货人：{{ detail.consignee }} {{ detail.phone ? `(${detail.phone})` : '' }}</div>
        </div>
      </el-card>

      <el-card shadow="never" class="mb-4">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="font-bold text-gray-800">商品清单</div>
            <div class="text-sm text-gray-500">共 {{ detail.orderDetailList?.length || 0 }} 件</div>
          </div>
        </template>
        <div v-if="!detail.orderDetailList?.length" class="text-center text-gray-400 py-8">
          暂无商品
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="item in detail.orderDetailList"
            :key="item.id"
            class="py-4 flex items-center"
          >
            <img :src="getImageUrl(item.image)" class="w-16 h-16 rounded-lg object-cover mr-4" alt="" />
            <div class="flex-1">
              <div class="font-semibold text-gray-900">{{ item.name }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ item.dishFlavor || '标准' }}</div>
            </div>
            <div class="text-right w-28 text-sm text-gray-600">x {{ item.number }}</div>
            <div class="text-right w-28 font-bold text-gray-900">¥ {{ item.amount }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="font-bold text-gray-800">费用明细</div>
        </template>
        <div class="space-y-2 text-sm text-gray-700">
          <div class="flex justify-between">
            <span>商品合计</span>
            <span>¥ {{ detail.amount || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span>打包费</span>
            <span>¥ {{ detail.packAmount || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span>配送费</span>
            <span>¥ {{ detail.deliveryAmount || 0 }}</span>
          </div>
          <div class="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
            <span>实付金额</span>
            <span class="text-red-600">¥ {{ detail.amount || 0 }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail } from '@/api/order'
import { getImageUrl } from '@/utils/image'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const detail = reactive<any>({})

const statusText = (status: number) => {
  const map: Record<number, string> = {
    1: '待支付',
    2: '待确认',
    3: '待发货',
    4: '运输中',
    5: '已完成',
    6: '已取消'
  }
  return map[status] || '未知'
}

const statusClass = (status: number) => {
  if (status === 2) return 'text-orange-500'
  if (status === 3 || status === 4) return 'text-blue-500'
  if (status === 5) return 'text-green-600'
  if (status === 6) return 'text-gray-400'
  return 'text-gray-600'
}

const payMethodText = (payMethod?: number) => {
  const map: Record<number, string> = {
    1: '微信',
    2: '支付宝',
    3: '银行卡'
  }
  return map[payMethod || 0] || '未选择'
}

const fetchDetail = async () => {
  const id = route.params.id as string
  if (!id) return
  try {
    const res: any = await getOrderDetail(id)
    Object.assign(detail, res || {})
  } catch (e) {
    console.error('Fetch order detail failed', e)
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.el-card {
  border-radius: 12px;
  border-color: #f0f2f5;
}
</style>
