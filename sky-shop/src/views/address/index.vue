<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-900">地址管理</h1>
        <button @click="handleAdd" class="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition shadow-sm">
          + 新增地址
        </button>
      </div>

      <div v-loading="loading" class="space-y-4">
        <div v-if="addressList.length === 0 && !loading" class="text-center py-20 bg-white rounded-xl text-gray-500">
            暂无收货地址
        </div>

        <div v-for="item in addressList" :key="item.id" class="bg-white rounded-xl shadow-sm p-6 flex items-center border hover:border-blue-100 transition group">
            <div class="flex-1">
                <div class="flex items-center mb-2">
                    <span class="font-bold text-lg mr-4">{{ item.consignee }}</span>
                    <span class="text-gray-500">{{ item.phone }}</span>
                    <span v-if="item.isDefault" class="ml-4 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100">默认</span>
                </div>
                <div class="text-gray-600">
                    {{ item.provinceName }}{{ item.cityName }}{{ item.districtName }}{{ item.detail }}
                </div>
            </div>
            
            <div class="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition">
                <button v-if="!item.isDefault" @click="handleSetDefault(item.id)" class="text-sm text-gray-500 hover:text-primary">设为默认</button>
                <button @click="handleEdit(item)" class="text-sm text-gray-500 hover:text-primary">编辑</button>
                <button @click="handleDelete(item.id)" class="text-sm text-red-400 hover:text-red-600">删除</button>
            </div>
        </div>
      </div>
    </div>

    <!-- 地址表单弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="收货人" prop="consignee">
          <el-input v-model="form.consignee" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="form.detail" type="textarea" placeholder="街道、门牌号等" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio label="1">先生</el-radio>
            <el-radio label="0">女士</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm(formRef)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { listAddress, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api/address'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'

const loading = ref(false)
const submitLoading = ref(false)
const addressList = ref<any[]>([])
const dialogVisible = ref(false)
const actionType = ref('add')
const formRef = ref<FormInstance>()

const dialogTitle = computed(() => actionType.value === 'add' ? '新增地址' : '编辑地址')

const form = reactive({
    id: undefined,
    consignee: '',
    phone: '',
    sex: '1',
    detail: '',
    label: '公司', // 默认标签
    provinceName: '北京市', // 简化处理，暂时固定或后期加城市选择器
    cityName: '北京市',
    districtName: '朝阳区'
})

const rules = {
    consignee: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
    phone: [{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
    detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const fetchData = async () => {
    loading.value = true
    try {
        const res: any = await listAddress()
        if (res) addressList.value = res
    } catch (e) {}
    finally { loading.value = false }
}

const handleAdd = () => {
    actionType.value = 'add'
    Object.assign(form, { id: undefined, consignee: '', phone: '', sex: '1', detail: '' })
    dialogVisible.value = true
}

const handleEdit = (item: any) => {
    actionType.value = 'edit'
    Object.assign(form, item)
    dialogVisible.value = true
}

const handleSetDefault = async (id: number) => {
    await setDefaultAddress(id)
    ElMessage.success('设置成功')
    fetchData()
}

const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定删除该地址吗？', '提示', { type: 'warning' }).then(async () => {
        await deleteAddress(id)
        ElMessage.success('已删除')
        fetchData()
    })
}

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            submitLoading.value = true
            try {
                if (actionType.value === 'add') {
                    await addAddress(form)
                    ElMessage.success('添加成功')
                } else {
                    await updateAddress(form)
                    ElMessage.success('修改成功')
                }
                dialogVisible.value = false
                fetchData()
            } catch (e) {}
            finally { submitLoading.value = false }
        }
    })
}

onMounted(() => {
    fetchData()
})
</script>
