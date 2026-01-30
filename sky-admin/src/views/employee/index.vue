<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar">
        <label style="margin-right: 10px">员工姓名：</label>
        <el-input
          v-model="queryParams.name"
          placeholder="请输入员工姓名"
          style="width: 200px"
          clearable
          @clear="fetchData"
          @keyup.enter="fetchData"
        />
        <el-button type="primary" class="search-btn" @click="fetchData">查询</el-button>
        <el-button
          type="primary"
          style="float: right"
          @click="handleAdd"
        >
          + 添加员工
        </el-button>
      </div>

      <el-table
        :data="tableData"
        stripe
        class="tableBox"
        v-loading="loading"
      >
        <el-table-column prop="name" label="员工姓名" />
        <el-table-column prop="username" label="账号" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column label="账号状态">
          <template #default="scope">
            <span :class="scope.row.status === 0 ? 'status-disable' : 'status-enable'">
              {{ scope.row.status === 0 ? '禁用' : '启用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="最后操作时间" width="200" />
        <el-table-column label="操作" width="160" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              :disabled="scope.row.username === 'admin'"
              @click="handleEdit(scope.row.id)"
            >
              修改
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              :disabled="scope.row.username === 'admin'"
              @click="handleStatusChange(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
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
import { getEmployeeList, enableOrDisableEmployee } from '@/api/employee'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await getEmployeeList(queryParams)
    // 根据 request.ts，直接返回 data 部分
    // 但这里需要确认后端返回结构，通常是 { records: [], total: 0 }
    // 如果 request.ts 已经解包了 code==1 的 data，那么 res 就是 { records: ..., total: ... }
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

const handleAdd = () => {
  router.push('/employee/add')
}

const handleEdit = (id: string) => {
  router.push({ path: '/employee/add', query: { id } })
}

const handleStatusChange = (row: any) => {
  const statusText = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确认要${statusText}该账号吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await enableOrDisableEmployee({ id: row.id, status: row.status === 1 ? 0 : 1 })
      ElMessage.success('账号状态更改成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
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
.tableBar {
  margin-bottom: 20px;
}
.search-btn {
  margin-left: 10px;
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
</style>