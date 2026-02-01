<template>
  <div class="dashboard-container">
    <div class="container">
      <!-- 顶部统计栏 -->
      <div class="status-tabs">
        <el-radio-group v-model="queryParams.status" @change="handleTabChange">
          <el-radio-button label="">全部订单</el-radio-button>
          <el-radio-button :label="2">
            待确认 <span class="badge" v-if="statistics.toBeConfirmed > 0">{{ statistics.toBeConfirmed }}</span>
          </el-radio-button>
          <el-radio-button :label="3">
            待发货 <span class="badge" v-if="statistics.confirmed > 0">{{ statistics.confirmed }}</span>
          </el-radio-button>
          <el-radio-button :label="4">
            运输中 <span class="badge" v-if="statistics.deliveryInProgress > 0">{{ statistics.deliveryInProgress }}</span>
          </el-radio-button>
          <el-radio-button :label="5">已签收</el-radio-button>
          <el-radio-button :label="6">已取消</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 搜索栏 -->
      <div class="tableBar">
        <div class="search-box">
          <label>订单号：</label>
          <el-input
            v-model="queryParams.number"
            placeholder="请输入订单号"
            style="width: 200px"
            clearable
            @clear="fetchData"
            @keyup.enter="fetchData"
          />
          
          <label>收货电话：</label>
           <el-input
            v-model="queryParams.phone"
            placeholder="请输入手机号"
            style="width: 150px"
            clearable
            @clear="fetchData"
            @keyup.enter="fetchData"
          />

          <label>下单时间：</label>
           <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px"
            @change="fetchData"
          />

          <el-button type="primary" class="search-btn" @click="fetchData">查询</el-button>
        </div>
      </div>

      <!-- 订单表格 -->
      <el-table
        :data="tableData"
        stripe
        class="tableBox"
        v-loading="loading"
      >
        <el-table-column label="订单号" prop="number" width="180" />
        <el-table-column label="订单状态" width="100">
           <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
           </template>
        </el-table-column>
        <el-table-column label="收货人" prop="consignee" width="100" />
        <el-table-column label="手机号" prop="phone" width="120" />
        <el-table-column label="收货地址" prop="address" min-width="200" show-overflow-tooltip />
        <el-table-column label="下单时间" prop="orderTime" width="180" />
        <el-table-column label="实收金额" prop="amount" width="100">
           <template #default="scope">￥{{ scope.row.amount }}</template>
        </el-table-column>
        
        <el-table-column label="预计/完成时间" width="180">
            <template #default="scope">
                {{ scope.row.deliveryTime || scope.row.estimatedDeliveryTime || '--' }}
            </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <!-- 1. 主业务操作 (最优先) -->
            <el-button 
               v-if="scope.row.status === 2" 
               type="success" 
               link 
               size="small" 
               @click="handleConfirm(scope.row)"
            >
              接单
            </el-button>

             <el-button 
               v-if="scope.row.status === 3" 
               type="warning" 
               link 
               size="small" 
               @click="handleDelivery(scope.row)"
            >
              发货
            </el-button>
            
            <el-button 
               v-if="scope.row.status === 4" 
               type="success" 
               link 
               size="small" 
               @click="handleComplete(scope.row)"
            >
              签收
            </el-button>

            <!-- 2. 查看 (居中) -->
            <el-button type="primary" link size="small" @click="handleDetail(scope.row.id)">
              查看
            </el-button>
            
             <!-- 3. 负向操作 (最右) -->
             <el-button 
               v-if="scope.row.status === 2" 
               type="danger" 
               link 
               size="small" 
               @click="handleReject(scope.row)"
            >
              拒单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 40]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
      
      <!-- 拒单/取消弹窗 -->
      <el-dialog v-model="rejectVisible" :title="rejectType === 'reject' ? '拒单原因' : '取消原因'" width="30%">
          <el-input v-model="rejectReason" type="textarea" placeholder="请输入原因" rows="3" />
          <template #footer>
             <el-button @click="rejectVisible = false">取消</el-button>
             <el-button type="primary" @click="submitReject">确认</el-button>
          </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
    getOrderPage, 
    getOrderStatistics, 
    confirmOrder, 
    rejectOrder, 
    deliveryOrder, 
    completeOrder,
    cancelOrder
} from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dateRange = ref([])
const statistics = reactive({
    toBeConfirmed: 0,
    confirmed: 0,
    deliveryInProgress: 0
})

// 拒单相关
const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectType = ref('reject') // reject | cancel
const currentOrderId = ref('')

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  number: '',
  phone: '',
  status: '' as any, // '' for all
  beginTime: '',
  endTime: ''
})

const getStatusText = (status: number) => {
    const map: any = {
        1: '待支付',
        2: '待确认',
        3: '待发货',
        4: '运输中',
        5: '已签收',
        6: '已取消'
    }
    return map[status] || '未知'
}

const getStatusType = (status: number) => {
    if (status === 2) return 'warning'
    if (status === 3 || status === 4) return 'primary'
    if (status === 5) return 'success'
    if (status === 6) return 'info'
    return ''
}

const fetchData = async () => {
  loading.value = true
  // 处理时间
  if (dateRange.value && dateRange.value.length === 2) {
      queryParams.beginTime = (dateRange.value[0] as any).toISOString().replace('T', ' ').slice(0, 19)
      queryParams.endTime = (dateRange.value[1] as any).toISOString().replace('T', ' ').slice(0, 19)
  } else {
      queryParams.beginTime = ''
      queryParams.endTime = ''
  }

  try {
    const res: any = await getOrderPage(queryParams)
    if (res && res.records) {
      tableData.value = res.records
      total.value = res.total
    } else {
      tableData.value = []
      total.value = 0
    }
    // 同时刷新统计数据
    fetchStatistics()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
    try {
        const res: any = await getOrderStatistics()
        if (res) {
            Object.assign(statistics, res)
        }
    } catch (e) {}
}

const handleTabChange = () => {
    queryParams.page = 1
    fetchData()
}

const handleDetail = (id: string) => {
    router.push({ path: '/order/detail', query: { id } })
}

// 业务操作
const handleConfirm = (row: any) => {
    ElMessageBox.confirm('确认接受此订单并准备发货吗？', '确认接单', {
        type: 'info'
    }).then(async () => {
        await confirmOrder({ id: row.id, status: 3 })
        ElMessage.success('接单成功')
        fetchData()
    })
}

const handleDelivery = (row: any) => {
     ElMessageBox.confirm('确认货物已发出？', '确认发货', {
        type: 'success'
    }).then(async () => {
        await deliveryOrder(row.id)
        ElMessage.success('发货成功')
        fetchData()
    })
}

const handleComplete = (row: any) => {
     ElMessageBox.confirm('确认客户已签收货物？', '确认签收', {
        type: 'success'
    }).then(async () => {
        await completeOrder(row.id)
        ElMessage.success('订单完成')
        fetchData()
    })
}

const handleReject = (row: any) => {
    rejectType.value = 'reject'
    currentOrderId.value = row.id
    rejectReason.value = ''
    rejectVisible.value = true
}

const submitReject = async () => {
    if (!rejectReason.value) {
        ElMessage.warning('请输入原因')
        return
    }
    try {
        if (rejectType.value === 'reject') {
            await rejectOrder({ id: currentOrderId.value, rejectionReason: rejectReason.value })
            ElMessage.success('已拒单')
        } else {
            await cancelOrder({ id: currentOrderId.value, cancelReason: rejectReason.value })
            ElMessage.success('已取消')
        }
        rejectVisible.value = false
        fetchData()
    } catch (e) {}
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
.container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}
.status-tabs {
    margin-bottom: 20px;
}
.status-tabs :deep(.el-radio-button__inner) {
    padding: 10px 20px;
    height: 40px;
    display: flex;
    align-items: center;
    position: relative;
}
.badge {
    background-color: #f56c6c;
    border-radius: 10px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    height: 16px;
    padding: 0 5px;
    white-space: nowrap;
    border: 1px solid #fff;
    
    /* 绝对定位，不占位 */
    position: absolute;
    top: -8px;
    right: -5px;
    z-index: 10;
}
.status-tabs :deep(.el-radio-button) {
    margin-right: 10px; /* 增加一点按钮之间的间距，防止角标遮挡 */
    overflow: visible; /* 允许角标溢出 */
}
/* 修正圆角 */
.status-tabs :deep(.el-radio-button:first-child .el-radio-button__inner),
.status-tabs :deep(.el-radio-button:last-child .el-radio-button__inner),
.status-tabs :deep(.el-radio-button__inner) {
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    box-shadow: none !important; /* 去掉选中时的阴影 */
}
/* 选中状态 */
.status-tabs :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: #409EFF;
    border-color: #409EFF;
    color: #fff;
}
.tableBar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
.search-box {
    display: flex;
    align-items: center;
    flex-wrap: wrap; 
    gap: 15px; /* 使用 gap 代替 margin-left，控制元素间距更均匀 */
}
.search-box label {
    margin-left: 0 !important; /* 清除内联样式的影响 */
    font-weight: normal;
    color: #606266;
}
.search-btn {
  margin-left: 0;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>