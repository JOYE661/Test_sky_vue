<template>
  <el-dialog
    v-model="visible"
    title="选择商品"
    width="60%"
    :before-close="handleClose"
  >
    <div class="search-bar">
      <el-input v-model="queryParams.name" placeholder="请输入商品名称" style="width: 200px" @keyup.enter="fetchData" />
      <el-button type="primary" @click="fetchData" style="margin-left: 10px">查询</el-button>
    </div>

    <el-table
      ref="tableRef"
      :data="tableData"
      v-loading="loading"
      height="400"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="商品名称" prop="name" />
      <el-table-column label="图片" width="80">
        <template #default="scope">
           <el-image :src="scope.row.image" style="width: 40px; height: 40px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column label="分类" prop="categoryName" />
      <el-table-column label="单价" prop="price">
          <template #default="scope">￥{{ scope.row.price }}</template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          layout="total, prev, pager, next"
          :total="total"
          @current-change="fetchData"
        />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认添加</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { getProductPage } from '@/api/product'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'select'])

const visible = ref(false)
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const selection = ref<any[]>([])

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  status: 1 // 只查上架的商品
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
      fetchData()
  }
})

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await getProductPage(queryParams)
    if (res && res.records) {
      tableData.value = res.records
      total.value = res.total
    }
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (val: any[]) => {
  selection.value = val
}

const handleClose = () => {
  visible.value = false
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('select', selection.value)
  handleClose()
}
</script>

<style scoped>
.search-bar {
    margin-bottom: 20px;
}
.pagination-container {
    margin-top: 10px;
    text-align: right;
}
</style>
