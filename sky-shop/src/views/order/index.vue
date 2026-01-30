<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-2xl font-bold mb-6">我的订单</h1>

      <!-- Tabs -->
      <div class="flex space-x-8 border-b border-gray-200 mb-6 overflow-x-auto bg-white px-6 rounded-t-xl">
        <button 
            v-for="tab in tabs" :key="tab.status"
            @click="handleTabChange(tab.status)"
            class="py-4 text-sm font-medium transition whitespace-nowrap"
            :class="queryParams.status === tab.status ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'"
        >
            {{ tab.name }}
        </button>
      </div>

      <!-- Order List -->
      <div v-loading="loading" class="space-y-4">
        <div v-if="orderList.length === 0 && !loading" class="bg-white rounded-xl p-20 text-center text-gray-500 shadow-sm">
            暂无相关订单
        </div>

        <div v-for="order in orderList" :key="order.id" class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <!-- Order Header -->
            <div class="px-6 py-4 bg-gray-50 flex justify-between items-center border-b border-gray-100">
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span>单号: {{ order.number }}</span>
                    <span>下单时间: {{ order.orderTime }}</span>
                </div>
                <div class="font-bold" :class="getStatusClass(order.status)">
                    {{ getStatusText(order.status) }}
                </div>
            </div>

            <!-- Order Body (Goods) -->
            <div class="px-6 py-4">
                <div v-for="item in order.orderDetailList" :key="item.id" class="flex items-center mb-4 last:mb-0">
                    <img :src="getImageUrl(item.image)" class="w-16 h-16 object-cover rounded-lg mr-4">
                    <div class="flex-1">
                        <div class="font-bold text-gray-800">{{ item.name }}</div>
                        <div class="text-xs text-gray-400 mt-1">{{ item.dishFlavor || '标准' }}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-500">x{{ item.number }}</div>
                        <div class="font-medium text-gray-900">¥{{ item.amount }}</div>
                    </div>
                </div>
            </div>

            <!-- Order Footer -->
            <div class="px-6 py-4 bg-white border-t border-gray-50 flex justify-between items-center">
                <div class="text-gray-600">
                    实付金额: <span class="text-lg font-bold text-red-600 ml-1">¥ {{ order.amount }}</span>
                </div>
                <div class="flex space-x-3">
                    <button v-if="order.status === 2" @click="handleCancel(order.id)" class="px-4 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消订单</button>
                    <button @click="router.push(`/order/detail/${order.id}`)" class="px-4 py-1.5 border border-primary text-primary rounded-lg text-sm hover:bg-blue-50">详情</button>
                    <button v-if="order.status === 5" @click="handleRepeat(order.id)" class="px-4 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-blue-600">再来一单</button>
                </div>
            </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="total > queryParams.pageSize" class="mt-8 flex justify-center">
          <el-pagination 
            v-model:current-page="queryParams.page"
            :page-size="queryParams.pageSize"
            layout="prev, pager, next"
            :total="total"
            @current-change="fetchData"
          />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getHistoryOrders, cancelOrder, repetitionOrder } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getImageUrl } from '@/utils/image'

const router = useRouter()
const loading = ref(false)
const orderList = ref<any[]>([])
const total = ref(0)

const tabs = [
    { name: '全部', status: undefined },
    { name: '待确认', status: 2 },
    { name: '待发货', status: 3 },
    { name: '运输中', status: 4 },
    { name: '已签收', status: 5 },
    { name: '已取消', status: 6 }
]

const queryParams = reactive({
    page: 1,
    pageSize: 5,
    status: undefined as number | undefined
})

const getStatusText = (status: number) => {
    const map: any = {
        1: '待支付', 2: '待确认', 3: '待发货', 4: '运输中', 5: '已完成', 6: '已取消'
    }
    return map[status] || '未知'
}

const getStatusClass = (status: number) => {
    if (status === 2) return 'text-orange-500'
    if (status === 3 || status === 4) return 'text-blue-500'
    if (status === 5) return 'text-green-500'
    return 'text-gray-400'
}

const fetchData = async () => {
    loading.value = true
    try {
        const res: any = await getHistoryOrders(queryParams)
        if (res) {
            orderList.value = res.records
            total.value = res.total
        }
    } catch (e) {}
    finally { loading.value = false }
}

const handleTabChange = (status: any) => {
    queryParams.status = status
    queryParams.page = 1
    fetchData()
}

const handleCancel = (id: string) => {
    ElMessageBox.confirm('确定取消订单吗？', '提示', { type: 'warning' }).then(async () => {
        await cancelOrder(id)
        ElMessage.success('已取消')
        fetchData()
    })
}

const handleRepeat = async (id: string) => {
    await repetitionOrder(id)
    ElMessage.success('已加入购物车')
    router.push('/cart')
}

onMounted(() => {
    fetchData()
})
</script>
