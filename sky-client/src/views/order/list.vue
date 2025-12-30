<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { historyOrders, cancelOrder, payOrder } from '@/api/order'
import { showToast, showConfirmDialog } from 'vant'
import { getImageUrl } from '@/utils/image'

const router = useRouter()
const route = useRoute()
const activeTab = ref(Number(route.query.status) || 0) // 0全部 1待付款 2待接单 3已接单 4派送中 5已完成 6已取消
const list = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

const statusMap: any = {
  1: '待付款',
  2: '待接单',
  3: '已接单',
  4: '派送中',
  5: '已完成',
  6: '已取消'
}

const onLoad = async () => {
  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize
    }
    // activeTab 对应 status? 这里的 tab index 和 status 并没有直接对应关系
    // 假设我们不按 Tab 过滤，或者后端接口支持 status 参数
    // 如果要做 Tab 切换，需要在 fetch 时传入 status
    if (activeTab.value !== 0) {
      params.status = activeTab.value
    }

    const res: any = await historyOrders(params)
    const records = res.records || []
    
    if (page.value === 1) {
      list.value = records
    } else {
      list.value.push(...records)
    }

    loading.value = false
    if (list.value.length >= res.total) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (error) {
    loading.value = false
    finished.value = true
  }
}

const onTabChange = () => {
  page.value = 1
  list.value = []
  loading.value = true
  finished.value = false
  onLoad()
}

const onCancel = (item: any) => {
  showConfirmDialog({ title: '确认取消订单吗？' }).then(async () => {
    await cancelOrder(item.id)
    showToast('已取消')
    onTabChange() // 刷新
  })
}

const onPay = async (item: any) => {
  try {
    await payOrder({ orderNumber: item.number, payMethod: 1 })
    showToast({ type: 'success', message: '支付成功' })
  } catch (err) {
    console.log('Mock pay error', err)
    showToast({ type: 'success', message: '支付成功(模拟)' })
  }
  // 刷新列表
  onTabChange()
}

onMounted(() => {
  // onLoad 会被 List 组件自动触发
})
</script>

<template>
  <div class="order-list-container">
    <van-nav-bar title="订单" fixed placeholder />
    
    <van-tabs v-model:active="activeTab" sticky offset-top="46" @change="onTabChange">
      <van-tab title="全部" :name="0"></van-tab>
      <van-tab title="待付款" :name="1"></van-tab>
      <van-tab title="待接单" :name="2"></van-tab>
      <van-tab title="派送中" :name="4"></van-tab>
      <van-tab title="已完成" :name="5"></van-tab>
    </van-tabs>

    <van-pull-refresh v-model="loading" @refresh="onTabChange">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="order-item" v-for="item in list" :key="item.id">
          <div class="header">
            <span class="time">{{ item.orderTime }}</span>
            <span class="status">{{ statusMap[item.status] }}</span>
          </div>
          <div class="content">
            <!-- 简单展示第一个商品，或者概要 -->
            <div class="goods-row" v-for="detail in (item.orderDetailList || []).slice(0, 2)" :key="detail.id">
               <van-image :src="getImageUrl(detail.image)" width="40" height="40" radius="4" style="margin-right: 8px; vertical-align: middle;" />
               <span class="name">{{ detail.name }}</span>
               <span class="num">x{{ detail.number }}</span>
            </div>
            <div v-if="item.orderDetailList && item.orderDetailList.length > 2" class="more">...</div>
          </div>
          <div class="footer">
            <div class="total">共{{ item.orderDetailList ? item.orderDetailList.length : 0 }}件商品，实付<span class="price">¥{{ item.amount }}</span></div>
            <div class="btns">
               <van-button size="small" v-if="item.status === 1" @click="onCancel(item)">取消订单</van-button>
               <van-button size="small" type="primary" v-if="item.status === 1" @click="onPay(item)">去支付</van-button>
               <van-button size="small" v-if="item.status === 5" @click="router.push('/home')">再来一单</van-button>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <van-tabbar route fixed placeholder z-index="9">
      <van-tabbar-item icon="home-o" to="/home">点餐</van-tabbar-item>
      <van-tabbar-item icon="orders-o" to="/orders">订单</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/me">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped lang="scss">
.order-list-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}

.order-item {
  background: #fff;
  margin: 10px;
  padding: 15px;
  border-radius: 8px;

  .header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999;
    border-bottom: 1px solid #f5f5f5;
    padding-bottom: 10px;
    margin-bottom: 10px;
    .status { color: #333; font-size: 14px; }
  }

  .goods-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-size: 14px;
    color: #666;
  }
  
  .footer {
    border-top: 1px solid #f5f5f5;
    padding-top: 10px;
    margin-top: 10px;
    text-align: right;
    
    .total {
      font-size: 12px;
      margin-bottom: 10px;
      .price { font-size: 16px; color: #333; font-weight: bold; margin-left: 5px; }
    }
    
    .btns {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  }
}
</style>
