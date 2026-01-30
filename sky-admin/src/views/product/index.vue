<template>
  <div class="dashboard-container">
    <div class="container">
      <!-- 搜索栏 -->
      <div class="tableBar">
        <div class="search-box">
          <label>商品名称：</label>
          <el-input
            v-model="queryParams.name"
            placeholder="请输入商品名称"
            style="width: 200px"
            clearable
            @clear="fetchData"
            @keyup.enter="fetchData"
          />

          <label style="margin-left: 20px">商品分类：</label>
          <el-select
            v-model="queryParams.categoryId"
            placeholder="请选择"
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
          <el-button type="primary" @click="handleAdd">+ 新增商品</el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        stripe
        class="tableBox"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品名称" prop="name" min-width="150" show-overflow-tooltip />
        
        <el-table-column label="图片" width="100" align="center">
          <template #default="scope">
            <el-image
              style="width: 60px; height: 60px; border-radius: 4px"
              :src="scope.row.image"
              :preview-src-list="[scope.row.image]"
              fit="cover"
              preview-teleported
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column label="商品分类" prop="categoryName" width="120" />
        
        <el-table-column label="单价" prop="price" width="100">
          <template #default="scope">
            <span>￥{{ scope.row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="售卖状态" width="100">
          <template #default="scope">
             <span :class="scope.row.status === 1 ? 'status-enable' : 'status-disable'">
              {{ scope.row.status === 1 ? '上架中' : '已下架' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="最后操作时间" prop="updateTime" width="180" />

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row.id)">
              修改
            </el-button>
            <el-button
              :type="scope.row.status === 1 ? 'danger' : 'primary'"
              link
              size="small"
              @click="handleStatusChange(scope.row)"
            >
              {{ scope.row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
import { getProductPage, deleteProduct, enableOrDisableProduct } from '@/api/product'
import { queryCategoryByType } from '@/api/category'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

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

// 获取分类列表用于下拉筛选 (type 1 = 产品分类)
const getCategoryList = async () => {
  try {
    const res: any = await queryCategoryByType({ type: 1 })
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
    const res: any = await getProductPage(queryParams)
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
  router.push('/product/add')
}

const handleEdit = (id: string) => {
  router.push({ path: '/product/add', query: { id } })
}

const handleStatusChange = (row: any) => {
  const actionText = row.status === 1 ? '下架' : '上架'
  ElMessageBox.confirm(`确认要${actionText}该商品吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await enableOrDisableProduct({ id: row.id, status: row.status === 1 ? 0 : 1 })
      ElMessage.success('操作成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

const handleDelete = (id: string) => {
  ElMessageBox.confirm('确认删除该商品吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteProduct(id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

const handleBatchDelete = () => {
  const ids = selection.value.map(item => item.id).join(',')
  ElMessageBox.confirm(`确认批量删除选中的 ${selection.value.length} 个商品吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteProduct(ids)
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
.status-disable {
  color: #fd5656;
}
.status-enable {
  color: #67c23a;
}
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}
</style>
