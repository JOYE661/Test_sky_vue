<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar">
        <div class="search-box">
          <label>单据名称：</label>
          <el-input
            v-model="queryParams.name"
            placeholder="请输入单据名称"
            style="width: 200px"
            clearable
            @clear="fetchData"
            @keyup.enter="fetchData"
          />

          <label style="margin-left: 20px">单据类型：</label>
          <el-select
            v-model="queryParams.categoryId"
            placeholder="请选择类型"
            clearable
            style="width: 200px"
            @change="fetchData"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>

          <el-button type="primary" class="search-btn" @click="fetchData">查询</el-button>
        </div>

        <div class="action-btn-group">
          <el-button type="danger" @click="handleBatchDelete" :disabled="selection.length === 0">批量删除</el-button>
          <el-button type="primary" @click="handleAdd">+ 创建单据</el-button>
        </div>
      </div>

      <el-table
        :data="tableData"
        stripe
        class="tableBox"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="单据名称" prop="name" min-width="180" show-overflow-tooltip />
        
        <el-table-column label="单据类型" prop="categoryName" width="150" />
        
        <el-table-column label="总金额" prop="price" width="120">
          <template #default="scope">
            <span>￥{{ scope.row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="120">
          <template #default="scope">
             <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '已审核' : '草稿' }}
             </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="最后操作时间" prop="updateTime" width="180" />

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row.id)" :disabled="scope.row.status === 1">
              修改
            </el-button>
            <el-button
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              link
              size="small"
              @click="handleStatusChange(scope.row)"
            >
              {{ scope.row.status === 1 ? '反审核' : '审核' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row.id)">
              删除
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getInventoryPage, deleteInventory, auditInventory } from '@/api/inventory'
import { queryCategoryByType } from '@/api/category'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const categoryList = ref<any[]>([])
const selection = ref<any[]>([])

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  categoryId: ''
})

// 获取“品牌分类”（复用为单据类型，type=2）
const getCategoryList = async () => {
  try {
    const res: any = await queryCategoryByType({ type: 2 })
    if (res) {
      categoryList.value = res
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await getInventoryPage(queryParams)
    if (res && res.records) {
      tableData.value = res.records
      total.value = res.total
    } else {
      tableData.value = []
      total.value = 0
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (val: any[]) => {
  selection.value = val
}

const handleAdd = () => {
  router.push('/inventory/add')
}

const handleEdit = (id: string) => {
  router.push({ path: '/inventory/add', query: { id } })
}

const handleStatusChange = (row: any) => {
  const confirmText = row.status === 1 
      ? '反审核后单据将变为草稿状态，可重新编辑，确认操作吗?' 
      : '审核后单据将生效，确认操作吗?'
      
  ElMessageBox.confirm(confirmText, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await auditInventory({ id: row.id, status: row.status === 1 ? 0 : 1 })
      ElMessage.success('操作成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

const handleDelete = (id: string) => {
  ElMessageBox.confirm('确认删除该单据吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteInventory(id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

const handleBatchDelete = () => {
  const ids = selection.value.map(item => item.id).join(',')
  ElMessageBox.confirm(`确认批量删除选中的 ${selection.value.length} 个单据吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteInventory(ids)
      ElMessage.success('批量删除成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  getCategoryList()
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
.tableBar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
}
.search-box {
    display: flex;
    align-items: center;
}
.search-btn {
  margin-left: 10px;
}
.action-btn-group {
    margin-left: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
