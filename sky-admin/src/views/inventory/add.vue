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
        label-width="120px"
        class="demo-ruleForm"
        style="margin-top: 30px"
      >
        <el-form-item label="单据名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="例如：20231027采购入库" maxlength="30" style="width: 400px"/>
        </el-form-item>

        <el-form-item label="单据类型" prop="categoryId">
          <el-select v-model="ruleForm.categoryId" placeholder="请选择单据类型" style="width: 400px">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="总金额">
           <span style="color: #f56c6c; font-weight: bold">￥{{ totalPrice.toFixed(2) }}</span>
           <span class="tip-text">（根据明细自动计算）</span>
        </el-form-item>

        <el-form-item label="单据描述" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            :rows="3"
            placeholder="备注信息"
            maxlength="200"
            show-word-limit
            style="width: 400px"
          />
        </el-form-item>
        
        <!-- 商品明细表格 -->
        <el-form-item label="商品明细">
           <div class="detail-box">
              <el-button type="primary" size="small" @click="showProductSelect = true" style="margin-bottom: 10px">
                  + 添加商品
              </el-button>
              
              <el-table :data="ruleForm.setmealDishes" border stripe>
                  <el-table-column label="商品名称" prop="name" />
                  <el-table-column label="单价" prop="price" width="100">
                      <template #default="scope">￥{{ scope.row.price }}</template>
                  </el-table-column>
                  <el-table-column label="数量" width="150">
                      <template #default="scope">
                          <el-input-number v-model="scope.row.copies" :min="1" size="small" />
                      </template>
                  </el-table-column>
                  <el-table-column label="小计" width="120">
                      <template #default="scope">
                          ￥{{ (scope.row.price * scope.row.copies).toFixed(2) }}
                      </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80" align="center">
                      <template #default="scope">
                          <el-button type="danger" link @click="removeDetail(scope.$index)">删除</el-button>
                      </template>
                  </el-table-column>
              </el-table>
              
              <div v-if="ruleForm.setmealDishes.length === 0" class="empty-detail">
                  暂无明细，请添加商品
              </div>
           </div>
        </el-form-item>

        <el-form-item>
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef, false)">保存</el-button>
          <el-button v-if="actionType === 'add'" type="primary" @click="submitForm(ruleFormRef, true)">
            保存并继续
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 商品选择弹窗 -->
      <product-select 
         v-model="showProductSelect"
         @select="handleProductSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addInventory, editInventory, queryInventoryById } from '@/api/inventory'
import { queryCategoryByType } from '@/api/category'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import ProductSelect from './components/ProductSelect.vue'

const router = useRouter()
const route = useRoute()

const ruleFormRef = ref<FormInstance>()
const actionType = ref('add')
const title = computed(() => actionType.value === 'add' ? '创建单据' : '修改单据')
const categoryList = ref<any[]>([])
const showProductSelect = ref(false)

const ruleForm = reactive({
  id: '',
  name: '',
  categoryId: '',
  price: 0,
  image: 'none', // 后端必填，给个默认值
  description: '',
  status: 1, 
  setmealDishes: [] as any[] // [{ dishId, name, price, copies }]
})

const totalPrice = computed(() => {
    return ruleForm.setmealDishes.reduce((sum, item) => {
        return sum + (item.price * item.copies)
    }, 0)
})

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入单据名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择单据类型', trigger: 'change' }]
})

const getCategoryList = async () => {
  try {
    const res: any = await queryCategoryByType({ type: 2 }) // 获取“品牌分类”作为单据类型
    if (res) categoryList.value = res
  } catch (error) { console.error(error) }
}

const initData = async () => {
  const id = route.query.id as string
  if (id) {
    actionType.value = 'edit'
    try {
      const res: any = await queryInventoryById(id)
      if (res) {
          Object.assign(ruleForm, res)
          // 后端返回的 setmealDishes 里可能没有 dishId，只有 id? 
          // 通常 setmealDishes = [{ dishId: 'xxx', copies: 1, ... }]
      }
    } catch (error) { console.error(error) }
  } else {
      // 自动生成个单据名
      const date = new Date()
      const dateStr = date.toISOString().slice(0,10).replace(/-/g,'')
      ruleForm.name = `${dateStr}入库单`
  }
}

const handleProductSelect = (selectedProducts: any[]) => {
    selectedProducts.forEach(product => {
        // 查重
        const exists = ruleForm.setmealDishes.find(item => item.dishId === product.id)
        if (!exists) {
            ruleForm.setmealDishes.push({
                dishId: product.id,
                name: product.name,
                price: product.price,
                copies: 1
            })
        }
    })
}

const removeDetail = (index: number) => {
    ruleForm.setmealDishes.splice(index, 1)
}

const goBack = () => {
  router.push('/inventory')
}

const submitForm = async (formEl: FormInstance | undefined, isContinue: boolean) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      if (ruleForm.setmealDishes.length === 0) {
          ElMessage.warning('请至少添加一个商品')
          return
      }
      
      // 提交前更新总价
      ruleForm.price = totalPrice.value
      
      const params = { ...ruleForm }
      try {
        if (actionType.value === 'add') {
            await addInventory(params)
            ElMessage.success('单据创建成功')
            if (isContinue) {
                formEl.resetFields()
                ruleForm.setmealDishes = []
                // 重置默认值
                const date = new Date()
                ruleForm.name = `${date.toISOString().slice(0,10).replace(/-/g,'')}入库单`
            } else {
                goBack()
            }
        } else {
            await editInventory(params)
            ElMessage.success('单据修改成功')
            goBack()
        }
      } catch (error) {
        console.error(error)
      }
    }
  })
}

onMounted(() => {
  getCategoryList()
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
.tip-text {
    color: #999;
    font-size: 12px;
    margin-left: 10px;
}
.detail-box {
    border: 1px solid #EBEEF5;
    padding: 10px;
    width: 800px;
}
.empty-detail {
    text-align: center;
    color: #909399;
    padding: 20px;
}
</style>
