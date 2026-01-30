<template>
  <div class="dashboard-container">
    <!-- 1. 今日数据 -->
    <div class="overview-box">
      <div class="title">
          今日数据
          <span class="sub-link" @click="router.push('/statistics')">数据详情</span>
      </div>
      <ul class="overview-list">
        <li class="overview-item">
          <div class="item-title">营业额</div>
          <div class="item-num">¥ {{ businessData.turnover }}</div>
        </li>
        <li class="overview-item">
          <div class="item-title">有效订单</div>
          <div class="item-num">{{ businessData.validOrderCount }}</div>
        </li>
        <li class="overview-item">
          <div class="item-title">订单完成率</div>
          <div class="item-num">{{ (businessData.orderCompletionRate * 100).toFixed(0) }}%</div>
        </li>
        <li class="overview-item">
          <div class="item-title">平均客单价</div>
          <div class="item-num">¥ {{ businessData.unitPrice }}</div>
        </li>
        <li class="overview-item">
          <div class="item-title">新增用户</div>
          <div class="item-num">{{ businessData.newUsers }}</div>
        </li>
      </ul>
    </div>

    <!-- 2. 订单信息 -->
    <div class="overview-box">
      <div class="title">
          订单信息
          <span class="sub-link" @click="router.push('/order')">订单明细</span>
      </div>
      <ul class="order-list">
        <li class="order-item" @click="handleJump('/order', 2)">
          <div class="item-title">待接单</div>
          <div class="item-num waiting">{{ orderOverview.waitingOrders }}</div>
        </li>
        <li class="order-item" @click="handleJump('/order', 3)">
          <div class="item-title">待派送</div>
          <div class="item-num delivering">{{ orderOverview.deliveredOrders }}</div>
        </li>
        <li class="order-item" @click="handleJump('/order', 5)">
          <div class="item-title">已完成</div>
          <div class="item-num">{{ orderOverview.completedOrders }}</div>
        </li>
        <li class="order-item" @click="handleJump('/order', 6)">
          <div class="item-title">已取消</div>
          <div class="item-num">{{ orderOverview.cancelledOrders }}</div>
        </li>
        <li class="order-item" @click="handleJump('/order')">
          <div class="item-title">全部订单</div>
          <div class="item-num">{{ orderOverview.allOrders }}</div>
        </li>
      </ul>
    </div>

    <!-- 3. 订单走势 (图表) -->
    <div class="overview-box chart-section">
       <div class="title">
           订单走势
           <span class="sub-link" @click="router.push('/statistics')">完整报表</span>
       </div>
       <div ref="chartRef" class="chart-box"></div>
    </div>

    <div class="bottom-box">
      <!-- 3. 产品总览 (原菜品) -->
      <div class="overview-box left-box">
        <div class="title">
            产品总览 
            <div>
                <span class="sub-link" @click="router.push('/product')">产品管理</span>
                <el-divider direction="vertical" />
                <span class="sub-link action" @click="router.push('/product/add')">新增产品</span>
            </div>
        </div>
        <div class="overview-content">
           <div class="overview-item">
              <div class="num sold">{{ dishOverview.sold }}</div>
              <div class="label">已上架</div>
           </div>
           <div class="overview-item">
              <div class="num stop">{{ dishOverview.discontinued }}</div>
              <div class="label">已下架</div>
           </div>
        </div>
      </div>

      <!-- 4. 库存总览 (原套餐) -->
      <div class="overview-box right-box">
        <div class="title">
            库存总览 
            <div>
                <span class="sub-link" @click="router.push('/inventory')">库存管理</span>
                <el-divider direction="vertical" />
                <span class="sub-link action" @click="router.push('/inventory/add')">新增单据</span>
            </div>
        </div>
        <div class="overview-content">
           <div class="overview-item">
              <div class="num sold">{{ setmealOverview.sold }}</div>
              <div class="label">已上架</div>
           </div>
           <div class="overview-item">
              <div class="num stop">{{ setmealOverview.discontinued }}</div>
              <div class="label">已下架</div>
           </div>
        </div>
      </div>
    </div>
    
    <!-- 5. 订单管理 (实时处理) -->
    <div class="overview-box order-manage-section">
       <div class="title">
           订单管理
           <span class="sub-link" @click="router.push('/order')">全部订单</span>
       </div>
       <el-tabs v-model="activeOrderTab" @tab-change="handleOrderTabChange">
          <el-tab-pane label="待接单" name="2">
              <el-table :data="waitingOrdersList" style="width: 100%" :show-header="true" stripe>
                  <el-table-column prop="number" label="订单号" width="180" />
                  <el-table-column prop="orderTime" label="下单时间" width="180" />
                  <el-table-column prop="consignee" label="收货人" />
                  <el-table-column prop="phone" label="手机号" />
                  <el-table-column prop="address" label="地址" show-overflow-tooltip />
                  <el-table-column prop="amount" label="金额">
                      <template #default="scope">¥{{ scope.row.amount }}</template>
                  </el-table-column>
                  <el-table-column label="操作" width="120" align="center">
                      <template #default="scope">
                          <el-button type="success" link @click="handleQuickConfirm(scope.row)">接单</el-button>
                          <el-button type="danger" link @click="handleQuickReject(scope.row)">拒单</el-button>
                      </template>
                  </el-table-column>
              </el-table>
          </el-tab-pane>
          <el-tab-pane label="待派送" name="3">
              <el-table :data="deliveringOrdersList" style="width: 100%" :show-header="true" stripe>
                  <el-table-column prop="number" label="订单号" width="180" />
                  <el-table-column prop="orderTime" label="下单时间" width="180" />
                  <el-table-column prop="consignee" label="收货人" />
                  <el-table-column prop="address" label="地址" show-overflow-tooltip />
                  <el-table-column prop="amount" label="金额">
                      <template #default="scope">¥{{ scope.row.amount }}</template>
                  </el-table-column>
                  <el-table-column label="操作" width="100" align="center">
                      <template #default="scope">
                          <el-button type="primary" link @click="handleQuickDelivery(scope.row)">发货</el-button>
                      </template>
                  </el-table-column>
              </el-table>
          </el-tab-pane>
       </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getBusinessData, getOrderOverview, getSetmealOverview, getDishOverview, getOrderStatistics } from '@/api/statistics'
import { getOrderPage, confirmOrder, deliveryOrder, rejectOrder } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const chartRef = ref()
let myChart: echarts.ECharts | null = null

const activeOrderTab = ref('2')
const waitingOrdersList = ref([])
const deliveringOrdersList = ref([])

const businessData = reactive({
    turnover: 0,
    validOrderCount: 0,
    orderCompletionRate: 0,
    unitPrice: 0,
    newUsers: 0
})

const orderOverview = reactive({
    waitingOrders: 0,
    deliveredOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    allOrders: 0
})

const dishOverview = reactive({
    sold: 0,
    discontinued: 0
})

const setmealOverview = reactive({
    sold: 0,
    discontinued: 0
})

const initData = async () => {
    try {
        const [res1, res2, res3, res4] = await Promise.all([
            getBusinessData(),
            getOrderOverview(),
            getDishOverview(),
            getSetmealOverview()
        ])
        
        if (res1) Object.assign(businessData, res1)
        if (res2) Object.assign(orderOverview, res2)
        if (res3) Object.assign(dishOverview, res3)
        if (res4) Object.assign(setmealOverview, res4)
        
        // 加载图表数据
        initChart()
        
        // 加载订单列表
        loadOrderList('2')
        loadOrderList('3')
        
    } catch (e) {
        console.error(e)
    }
}

const initChart = async () => {
    // 默认查询最近30天数据
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
    
    const params = {
        begin: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10)
    }

    try {
        const res: any = await getOrderStatistics(params)
        if (res) {
            await nextTick()
            if (myChart) myChart.dispose()
            myChart = echarts.init(chartRef.value)
            
            const dateList = res.dateList ? res.dateList.split(',') : []
            const orderCountList = res.orderCountList ? res.orderCountList.split(',') : []
            const validOrderCountList = res.validOrderCountList ? res.validOrderCountList.split(',') : []
            
            myChart.setOption({
                tooltip: { trigger: 'axis' },
                legend: { top: 0, right: 20, data: ['订单总数', '有效订单'] },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
                xAxis: { 
                    type: 'category', 
                    boundaryGap: false, 
                    data: dateList,
                    axisLabel: {
                        formatter: (value: string) => value.slice(5), // 只显示 MM-DD
                        interval: 'auto' 
                    },
                    axisLine: { lineStyle: { color: '#999' } }
                },
                yAxis: { 
                    type: 'value',
                    splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
                },
                series: [
                    { 
                        name: '订单总数', 
                        type: 'line', 
                        smooth: true, 
                        showSymbol: false,
                        itemStyle: { color: '#409EFF' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(64,158,255,0.3)' },
                                { offset: 1, color: 'rgba(64,158,255,0)' }
                            ])
                        },
                        data: orderCountList 
                    },
                    { 
                        name: '有效订单', 
                        type: 'line', 
                        smooth: true, 
                        showSymbol: false,
                        itemStyle: { color: '#67C23A' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(103,194,58,0.3)' },
                                { offset: 1, color: 'rgba(103,194,58,0)' }
                            ])
                        },
                        data: validOrderCountList 
                    }
                ]
            })
        }
    } catch (e) {}
}

const loadOrderList = async (status: string) => {
    try {
        const res: any = await getOrderPage({ page: 1, pageSize: 5, status: parseInt(status) })
        if (res && res.records) {
            if (status === '2') waitingOrdersList.value = res.records
            if (status === '3') deliveringOrdersList.value = res.records
        }
    } catch(e) {}
}

const handleOrderTabChange = (val: string) => {
    loadOrderList(val)
}

const handleQuickConfirm = (row: any) => {
    ElMessageBox.confirm('确认接单?', '提示', { type: 'info' }).then(async () => {
        await confirmOrder({ id: row.id, status: 3 })
        ElMessage.success('接单成功')
        loadOrderList('2')
        loadOrderList('3') // 刷新待派送
        initData() // 刷新概览数字
    })
}

const handleQuickDelivery = (row: any) => {
    ElMessageBox.confirm('确认发货?', '提示', { type: 'success' }).then(async () => {
        await deliveryOrder(row.id)
        ElMessage.success('发货成功')
        loadOrderList('3')
        initData()
    })
}

const handleQuickReject = (row: any) => {
    ElMessageBox.prompt('请输入拒单原因', '拒单', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
    }).then(async ({ value }) => {
        if (!value) return ElMessage.warning('请输入原因')
        await rejectOrder({ id: row.id, rejectionReason: value })
        ElMessage.success('已拒单')
        loadOrderList('2')
        initData()
    })
}

const handleJump = (path: string, status?: number) => {
    router.push({ path, query: status ? { status: status.toString() } : {} })
}

window.addEventListener('resize', () => {
    myChart?.resize()
})

onMounted(() => {
    initData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.overview-box {
    background: #fff;
    padding: 30px;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0,21,41,.05);
}

.title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 25px;
    color: #333;
    display: flex;
    justify-content: space-between;
}
.sub-link {
    font-size: 14px;
    color: #666;
    cursor: pointer;
    font-weight: normal;
}
.sub-link:hover {
    color: #409EFF;
}
.sub-link.action {
    color: #409EFF;
    font-weight: 500;
}
.sub-link.action:hover {
    opacity: 0.8;
}

/* 今日数据列表 */
.overview-list {
    display: flex;
    justify-content: space-between;
    padding: 0;
    margin: 0;
    list-style: none;
}
.overview-item {
    text-align: center;
    flex: 1;
}
.overview-item .item-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
}
.overview-item .item-num {
    font-size: 26px;
    font-weight: bold;
    color: #333;
}

/* 订单管理列表 */
.order-list {
    display: flex;
    justify-content: space-between;
    padding: 0;
    margin: 0;
    list-style: none;
}
.order-item {
    text-align: center;
    flex: 1;
    cursor: pointer;
    padding: 15px 0;
    border-radius: 4px;
    transition: background 0.3s;
}
.order-item:hover {
    background: #f5f7fa;
}
.order-item .item-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
}
.order-item .item-num {
    font-size: 30px;
    font-weight: bold;
    color: #409EFF; /* 默认蓝 */
}
.order-item .item-num.waiting { color: #E6A23C; }
.order-item .item-num.delivering { color: #409EFF; }

/* 底部两栏 */
.bottom-box {
    display: flex;
    justify-content: space-between;
}
.left-box, .right-box {
    width: 49%;
}
.overview-content {
    display: flex;
    justify-content: space-around;
    padding: 20px 0;
}
.overview-content .overview-item {
    text-align: center;
}
.overview-content .num {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 10px;
}
.overview-content .num.sold { color: #E6A23C; }
.overview-content .num.stop { color: #909399; }
.overview-content .label {
    font-size: 14px;
    color: #666;
}

.chart-box {
    width: 100%;
    height: 450px;
}
</style>
