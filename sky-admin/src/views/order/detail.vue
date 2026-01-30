<template>
  <div class="detail-container">
    <div class="container">
      <el-page-header @back="goBack" content="订单详情" class="header" />
      
      <!-- 状态概览区 -->
      <div class="status-card">
          <div class="status-info">
             <span class="label">当前状态：</span>
             <span class="value" :class="getStatusClass(orderInfo.status)">{{ getStatusText(orderInfo.status) }}</span>
          </div>
          <div class="actions">
             <!-- 根据状态显示不同按钮 -->
             <el-button v-if="orderInfo.status === 2" type="success" @click="handleConfirm">接单</el-button>
             <el-button v-if="orderInfo.status === 2" type="danger" @click="handleReject">拒单</el-button>
             
             <el-button v-if="orderInfo.status === 3" type="primary" @click="handleDelivery">发货</el-button>
             <el-button v-if="orderInfo.status === 3" type="danger" @click="handleCancel">取消订单</el-button>
             
             <el-button v-if="orderInfo.status === 4" type="success" @click="handleComplete">确认签收</el-button>
          </div>
      </div>
      
      <el-divider />
      
      <!-- 基础信息 -->
      <div class="info-section">
         <h3>基础信息</h3>
         <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ orderInfo.number }}</el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ orderInfo.orderTime }}</el-descriptions-item>
            <el-descriptions-item label="支付方式">
                {{ orderInfo.payMethod === 1 ? '微信支付' : '支付宝' }}
            </el-descriptions-item>
            <el-descriptions-item label="实收金额">
                <span style="color: #f56c6c; font-weight: bold">￥{{ orderInfo.amount }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="备注">{{ orderInfo.remark || '无' }}</el-descriptions-item>
         </el-descriptions>
      </div>
      
      <!-- 收货信息 -->
      <div class="info-section">
         <h3>收货信息</h3>
         <el-descriptions :column="2" border>
            <el-descriptions-item label="收货人">{{ orderInfo.consignee }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ orderInfo.phone }}</el-descriptions-item>
            <el-descriptions-item label="收货地址" :span="2">{{ orderInfo.address }}</el-descriptions-item>
         </el-descriptions>
      </div>
      
      <!-- 商品明细 -->
      <div class="info-section">
         <h3>商品明细</h3>
         <el-table :data="orderInfo.orderDetailList" border stripe>
             <el-table-column label="商品名称" prop="name" />
             <el-table-column label="图片" width="100" align="center">
                 <template #default="scope">
                     <el-image :src="scope.row.image" style="width: 50px; height: 50px" fit="cover" />
                 </template>
             </el-table-column>
             <el-table-column label="单价" width="120">
                 <template #default="scope">￥{{ scope.row.amount }}</template>
             </el-table-column>
             <el-table-column label="数量" prop="number" width="120" />
             <el-table-column label="小计" width="120">
                 <template #default="scope">
                     ￥{{ (scope.row.amount * scope.row.number).toFixed(2) }}
                 </template>
             </el-table-column>
         </el-table>
      </div>

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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
    queryOrderById, 
    confirmOrder, 
    deliveryOrder, 
    completeOrder, 
    rejectOrder, 
    cancelOrder 
} from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const orderInfo = ref<any>({
    orderDetailList: []
})
const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectType = ref('reject')

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

const getStatusClass = (status: number) => {
    if (status === 2) return 'status-warning'
    if (status === 3 || status === 4) return 'status-primary'
    if (status === 5) return 'status-success'
    return 'status-info'
}

const goBack = () => {
    router.back()
}

const initData = async () => {
    const id = route.query.id as string
    if (id) {
        try {
            const res: any = await queryOrderById(id)
            if (res) {
                orderInfo.value = res
            }
        } catch (error) { console.error(error) }
    }
}

// 业务操作
const handleConfirm = () => {
    ElMessageBox.confirm('确认接受此订单并准备发货吗？', '确认接单', { type: 'info' })
      .then(async () => {
          await confirmOrder({ id: orderInfo.value.id, status: 3 })
          ElMessage.success('接单成功')
          initData()
      })
}

const handleDelivery = () => {
    ElMessageBox.confirm('确认货物已发出？', '确认发货', { type: 'success' })
      .then(async () => {
          await deliveryOrder(orderInfo.value.id)
          ElMessage.success('发货成功')
          initData()
      })
}

const handleComplete = () => {
    ElMessageBox.confirm('确认客户已签收货物？', '确认签收', { type: 'success' })
      .then(async () => {
          await completeOrder(orderInfo.value.id)
          ElMessage.success('订单完成')
          initData()
      })
}

const handleReject = () => {
    rejectType.value = 'reject'
    rejectReason.value = ''
    rejectVisible.value = true
}

const handleCancel = () => {
    rejectType.value = 'cancel'
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
            await rejectOrder({ id: orderInfo.value.id, rejectionReason: rejectReason.value })
            ElMessage.success('已拒单')
        } else {
            await cancelOrder({ id: orderInfo.value.id, cancelReason: rejectReason.value })
            ElMessage.success('已取消')
        }
        rejectVisible.value = false
        initData()
    } catch (e) {}
}

onMounted(() => {
    initData()
})
</script>

<style scoped>
.detail-container {
    padding: 20px;
}
.container {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
}
.header {
    margin-bottom: 20px;
}
.status-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.status-info {
    font-size: 16px;
    font-weight: bold;
}
.status-warning { color: #e6a23c; }
.status-primary { color: #409eff; }
.status-success { color: #67c23a; }
.status-info { color: #909399; }

.info-section {
    margin-bottom: 30px;
}
.info-section h3 {
    margin-bottom: 15px;
    font-size: 16px;
    border-left: 4px solid #409EFF;
    padding-left: 10px;
}
</style>
