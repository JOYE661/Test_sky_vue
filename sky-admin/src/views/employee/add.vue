<template>
  <div class="add-brand-container">
    <div class="container">
      <div class="header">
        <el-page-header @back="goBack" :content="title" />
      </div>
      
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-width="180px"
        class="demo-ruleForm"
        style="margin-top: 30px"
      >
        <el-form-item label="账号:" prop="username">
          <el-input
            v-model="ruleForm.username"
            placeholder="请输入账号"
            maxlength="20"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item label="员工姓名:" prop="name">
          <el-input
            v-model="ruleForm.name"
            placeholder="请输入员工姓名"
            maxlength="12"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item label="手机号:" prop="phone">
          <el-input
            v-model="ruleForm.phone"
            placeholder="请输入手机号"
            maxlength="11"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item label="性别:" prop="sex">
          <el-radio-group v-model="ruleForm.sex">
            <el-radio label="1">男</el-radio>
            <el-radio label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="身份证号:" prop="idNumber">
          <el-input
            v-model="ruleForm.idNumber"
            placeholder="请输入身份证号"
            maxlength="20"
            style="width: 300px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef, false)">保存</el-button>
          <el-button v-if="actionType === 'add'" type="primary" @click="submitForm(ruleFormRef, true)">
            保存并继续添加
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addEmployee, editEmployee, queryEmployeeById } from '@/api/employee'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()

const ruleFormRef = ref<FormInstance>()
const actionType = ref('add')
const title = computed(() => actionType.value === 'add' ? '添加员工' : '修改员工信息')

const ruleForm = reactive({
  id: '',
  username: '',
  name: '',
  phone: '',
  sex: '1', // 默认男. 后端可能用 '1'/'0' 字符串或数字，需注意
  idNumber: ''
})

// 校验规则
const validatePhone = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入手机号'))
  } else if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const validateID = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入身份证号码'))
  } else if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value)) {
    callback(new Error('身份证号码不正确'))
  } else {
    callback()
  }
}

const validateAccount = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入账号'))
  } else if (!/^([a-z]|[0-9]){3,20}$/.test(value)) {
    callback(new Error('账号输入不符，请输入3-20个字符'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  username: [{ required: true, validator: validateAccount, trigger: 'blur' }],
  name: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  idNumber: [{ required: true, validator: validateID, trigger: 'blur' }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }]
})

const goBack = () => {
  router.push('/employee')
}

const initData = async () => {
  const id = route.query.id as string
  if (id) {
    actionType.value = 'edit'
    try {
      const res: any = await queryEmployeeById(id)
      if (res) {
          // 注意：后端可能返回的是 '1'/'0'，Element Radio 需要匹配
          Object.assign(ruleForm, res)
      }
    } catch (error) {
      console.error(error)
    }
  }
}

const submitForm = async (formEl: FormInstance | undefined, isContinue: boolean) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      try {
        if (actionType.value === 'add') {
            await addEmployee(ruleForm)
            ElMessage.success('员工添加成功')
            if (isContinue) {
                formEl.resetFields()
                ruleForm.sex = '1' // 重置默认值
            } else {
                goBack()
            }
        } else {
            await editEmployee(ruleForm)
            ElMessage.success('员工信息修改成功')
            goBack()
        }
      } catch (error) {
        console.error(error)
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.add-brand-container {
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
</style>
