<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar">
        <div class="search-box">
          <label style="margin-right: 10px">分类名称：</label>
          <el-input
            v-model="queryParams.name"
            placeholder="请填写分类名称"
            style="width: 200px"
            clearable
            @clear="fetchData"
            @keyup.enter="fetchData"
          />

          <label style="margin-right: 5px; margin-left: 20px">分类类型：</label>
          <el-select
            v-model="queryParams.type"
            placeholder="请选择"
            clearable
            style="width: 200px"
            @clear="fetchData"
            @change="fetchData"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <el-button type="primary" class="search-btn" @click="fetchData">查询</el-button>
        </div>
        
        <div class="action-btn-group">
          <el-button type="primary" @click="handleAdd('1')"> + 新增产品分类 </el-button>
          <el-button type="primary" style="margin-left: 20px" @click="handleAdd('2')"> + 新增品牌分类 </el-button>
        </div>
      </div>

      <el-table :data="tableData" stripe class="tableBox" v-loading="loading">
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="type" label="分类类型">
          <template #default="scope">
            <span>{{ scope.row.type === 1 ? '产品分类' : '品牌分类' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" />
        <el-table-column label="状态">
          <template #default="scope">
            <span :class="scope.row.status === 0 ? 'status-disable' : 'status-enable'">
              {{ scope.row.status === 0 ? '禁用' : '启用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="操作时间" width="200" />
        <el-table-column label="操作" width="160" align="center">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">
              修改
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row.id)">
              删除
            </el-button>
            <el-button
              :type="scope.row.status === 0 ? 'primary' : 'danger'"
              link
              size="small"
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

      <!-- Add/Edit Dialog -->
      <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="30%"
        :before-close="handleClose"
      >
        <el-form
          ref="ruleFormRef"
          :model="dialogForm"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="分类名称：" prop="name">
            <el-input v-model="dialogForm.name" placeholder="请输入分类名称" maxlength="20" />
          </el-form-item>
          <el-form-item label="排序：" prop="sort">
            <el-input v-model="dialogForm.sort" placeholder="请输入排序" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleClose">取 消</el-button>
            <el-button type="primary" @click="submitForm(ruleFormRef, false)">确 定</el-button>
            <el-button v-if="actionType === 'add'" type="primary" @click="submitForm(ruleFormRef, true)">
              保存并继续添加
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { getCategoryPage, addCategory, editCategory, deleCategory, enableOrDisableCategory } from '@/api/category'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const actionType = ref('add') // 'add' or 'edit'
const dialogFormType = ref('1') // '1' dish, '2' meal
const ruleFormRef = ref<FormInstance>()

const dialogTitle = computed(() => {
  if (actionType.value === 'edit') return '修改分类'
  return dialogFormType.value === '1' ? '新增产品分类' : '新增品牌分类'
})

const options = [
  { value: 1, label: '产品分类' },
  { value: 2, label: '品牌分类' }
]

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  type: ''
})

const dialogForm = reactive({
  id: '',
  name: '',
  sort: '',
  type: 1
})

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' },
    { pattern: /^\d+$/, message: '排序只能输入数字', trigger: 'blur' }
  ]
})

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await getCategoryPage(queryParams)
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

const handleAdd = (type: string) => {
  actionType.value = 'add'
  dialogFormType.value = type
  dialogForm.type = Number(type)
  dialogForm.name = ''
  dialogForm.sort = ''
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  actionType.value = 'edit'
  dialogForm.id = row.id
  dialogForm.name = row.name
  dialogForm.sort = row.sort
  dialogForm.type = row.type
  dialogVisible.value = true
}

const handleDelete = (id: string) => {
  ElMessageBox.confirm('此操作将永久删除该分类，是否继续？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleCategory(id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

const handleStatusChange = (row: any) => {
  const statusText = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确认要${statusText}该分类吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await enableOrDisableCategory({ id: row.id, status: row.status === 1 ? 0 : 1 })
      ElMessage.success('状态更改成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

const handleClose = () => {
  dialogVisible.value = false
  ruleFormRef.value?.resetFields()
}

const submitForm = async (formEl: FormInstance | undefined, isContinue: boolean) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (actionType.value === 'add') {
          await addCategory({
            name: dialogForm.name,
            sort: dialogForm.sort,
            type: dialogForm.type
          })
          ElMessage.success('分类添加成功')
        } else {
          await editCategory({
            id: dialogForm.id,
            name: dialogForm.name,
            sort: dialogForm.sort
          })
          ElMessage.success('分类修改成功')
        }
        
        if (isContinue) {
           dialogForm.name = ''
           dialogForm.sort = ''
           // 不关闭弹窗，不重置 type
        } else {
           handleClose()
        }
        fetchData()
      } catch (error) {
        console.error(error)
      }
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
</style>