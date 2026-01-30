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
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入商品名称" maxlength="20" style="width: 400px"/>
        </el-form-item>

        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="ruleForm.categoryId" placeholder="请选择商品分类" style="width: 400px">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="商品单价" prop="price">
           <el-input-number v-model="ruleForm.price" :precision="2" :step="0.1" :min="0" style="width: 200px" />
           <span class="unit-text">元</span>
        </el-form-item>

        <el-form-item label="商品主图" prop="image">
          <image-upload v-model="ruleForm.image" :size="2" />
          <div class="tip-text">建议尺寸：200*200，支持jpg、png格式</div>
        </el-form-item>

        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述，如材质、产地等"
            maxlength="200"
            show-word-limit
            style="width: 400px"
          />
        </el-form-item>

        <!-- 规格属性 (原口味配置) -->
        <el-form-item label="规格属性">
          <div class="flavor-box">
             <div v-if="ruleForm.flavors.length === 0" class="flavor-empty">
                <el-button type="primary" link @click="addFlavor">+ 添加规格</el-button>
                <span class="tip-text">（如：颜色、尺寸、重量）</span>
             </div>
             
             <div v-for="(item, index) in ruleForm.flavors" :key="index" class="flavor-item">
                <div class="flavor-header">
                   <span class="label">规格名</span>
                   <el-select 
                      v-model="item.name" 
                      filterable 
                      allow-create 
                      default-first-option
                      placeholder="如：颜色" 
                      style="width: 150px"
                      @change="(val) => handleFlavorNameChange(val, index)"
                    >
                      <el-option v-for="opt in flavorOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                   </el-select>
                   
                   <span class="label" style="margin-left: 20px">规格值</span>
                   <div class="tags-input">
                       <el-tag
                        v-for="(tag, tagIndex) in JSON.parse(item.value || '[]')"
                        :key="tagIndex"
                        closable
                        :disable-transitions="false"
                        @close="handleCloseTag(index, tagIndex)"
                        style="margin-right: 5px"
                      >
                        {{ tag }}
                      </el-tag>
                      <el-input
                        class="input-new-tag"
                        v-if="inputVisible[index]"
                        v-model="inputValue[index]"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter="handleInputConfirm(index)"
                        @blur="handleInputConfirm(index)"
                        style="width: 100px"
                      />
                      <el-button v-else class="button-new-tag" size="small" @click="showInput(index)">
                        + 添加值
                      </el-button>
                   </div>
                   
                   <el-button type="danger" link @click="removeFlavor(index)" style="margin-left: auto">删除</el-button>
                </div>
             </div>
             
             <el-button v-if="ruleForm.flavors.length > 0" type="primary" link @click="addFlavor" style="margin-top: 10px">
               + 继续添加规格
             </el-button>
          </div>
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
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addProduct, editProduct, queryProductById } from '@/api/product'
import { queryCategoryByType } from '@/api/category'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import ImageUpload from '@/components/ImageUpload/index.vue'

const router = useRouter()
const route = useRoute()

const ruleFormRef = ref<FormInstance>()
const actionType = ref('add')
const title = computed(() => actionType.value === 'add' ? '添加商品' : '修改商品信息')
const categoryList = ref<any[]>([])

// 规格相关
const inputVisible = ref<boolean[]>([])
const inputValue = ref<string[]>([])
// 预设规格名，供应链常用
const flavorOptions = [
    { value: '颜色', label: '颜色' },
    { value: '尺寸', label: '尺寸' },
    { value: '重量', label: '重量' },
    { value: '材质', label: '材质' }
]

const ruleForm = reactive({
  id: '',
  name: '',
  categoryId: '',
  price: 0,
  image: '',
  description: '',
  status: 1, // 默认上架
  flavors: [] as any[] // [{ name: '颜色', value: '["红","蓝"]' }]
})

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品单价', trigger: 'blur' }],
  image: [{ required: true, message: '请上传商品主图', trigger: 'change' }]
})

const getCategoryList = async () => {
  try {
    const res: any = await queryCategoryByType({ type: 1 })
    if (res) categoryList.value = res
  } catch (error) { console.error(error) }
}

const initData = async () => {
  const id = route.query.id as string
  if (id) {
    actionType.value = 'edit'
    try {
      const res: any = await queryProductById(id)
      if (res) {
          Object.assign(ruleForm, res)
          // 确保 flavors 存在
          if (!ruleForm.flavors) ruleForm.flavors = []
      }
    } catch (error) { console.error(error) }
  }
}

// 规格操作逻辑
const addFlavor = () => {
    ruleForm.flavors.push({ name: '', value: '[]' })
    inputVisible.value.push(false)
    inputValue.value.push('')
}

const removeFlavor = (index: number) => {
    ruleForm.flavors.splice(index, 1)
    inputVisible.value.splice(index, 1)
    inputValue.value.splice(index, 1)
}

const handleFlavorNameChange = (val: string, index: number) => {
    // 可以在这里做一些自动填充逻辑，暂时不需要
}

const showInput = (index: number) => {
    inputVisible.value[index] = true
    // TODO: focus
}

const handleInputConfirm = (index: number) => {
    const val = inputValue.value[index]
    if (val) {
        let tags = JSON.parse(ruleForm.flavors[index].value || '[]')
        if (!tags.includes(val)) {
            tags.push(val)
            ruleForm.flavors[index].value = JSON.stringify(tags)
        }
    }
    inputVisible.value[index] = false
    inputValue.value[index] = ''
}

const handleCloseTag = (flavorIndex: number, tagIndex: number) => {
    let tags = JSON.parse(ruleForm.flavors[flavorIndex].value || '[]')
    tags.splice(tagIndex, 1)
    ruleForm.flavors[flavorIndex].value = JSON.stringify(tags)
}

const goBack = () => {
  router.push('/product') // 修改回退路径
}

const submitForm = async (formEl: FormInstance | undefined, isContinue: boolean) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      const params = { ...ruleForm }
      try {
        if (actionType.value === 'add') {
            await addProduct(params)
            ElMessage.success('商品添加成功')
            if (isContinue) {
                formEl.resetFields()
                ruleForm.image = ''
                ruleForm.flavors = []
                ruleForm.description = ''
            } else {
                goBack()
            }
        } else {
            await editProduct(params)
            ElMessage.success('商品修改成功')
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
.unit-text {
    margin-left: 10px;
}
.tip-text {
    color: #999;
    font-size: 12px;
    margin-left: 10px;
}

/* 规格样式 */
.flavor-box {
    border: 1px solid #e4e7ed;
    padding: 15px;
    border-radius: 4px;
    width: 600px;
}
.flavor-item {
    margin-bottom: 15px;
    border-bottom: 1px dashed #eee;
    padding-bottom: 15px;
}
.flavor-header {
    display: flex;
    align-items: center;
}
.label {
    font-size: 14px;
    color: #606266;
    margin-right: 10px;
}
.tags-input {
    flex: 1;
    margin-left: 10px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}
</style>
