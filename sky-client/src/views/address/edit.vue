<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addAddress, updateAddress, deleteAddress, getAddressById } from '@/api/address'
import { areaList } from '@vant/area-data' // 需要安装依赖，暂时会报错，下面处理
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const addressId = route.query.id
const isEdit = !!addressId
const addressInfo = ref<any>({})

// 如果没有 @vant/area-data，我们可以自己定义一个简单的
// 这里为了演示，假设有了。如果没有，我将在下一步安装它。
// 实际上，为了保险，我先用一个空的 areaList，等下安装依赖。
const areaData = ref(areaList) 

const onSave = async (content: any) => {
  // 构造参数
  const params = {
    ...content,
    provinceCode: content.areaCode ? content.areaCode.slice(0,2) + '0000' : '',
    cityCode: content.areaCode ? content.areaCode.slice(0,4) + '00' : '',
    districtCode: content.areaCode || '',
    provinceName: content.province,
    cityName: content.city,
    districtName: content.county,
    detail: content.addressDetail,
    consignee: content.name,
    phone: content.tel,
    sex: '0', // 默认性别
    label: content.isDefault ? '1' : '0' // 标签或默认
  }

  // 修正后端字段差异
  params.isDefault = content.isDefault ? 1 : 0

  try {
    if (isEdit) {
      params.id = addressId
      await updateAddress(params)
    } else {
      await addAddress(params)
    }
    showToast('保存成功')
    router.back()
  } catch (error) {
    console.error(error)
  }
}

const onDelete = async () => {
  if (isEdit) {
    try {
      await deleteAddress(Number(addressId))
      showToast('删除成功')
      router.back()
    } catch (error) {
      console.error(error)
    }
  }
}

onMounted(async () => {
  if (isEdit) {
    const res: any = await getAddressById(Number(addressId))
    if (res) {
       // 转换回 Vant 格式
       addressInfo.value = {
         id: res.id,
         name: res.consignee,
         tel: res.phone,
         province: res.provinceName,
         city: res.cityName,
         county: res.districtName,
         addressDetail: res.detail,
         areaCode: res.districtCode,
         isDefault: res.isDefault === 1
       }
    }
  }
})
</script>

<template>
  <div class="address-edit-container">
    <van-nav-bar 
      :title="isEdit ? '编辑地址' : '新增地址'" 
      left-arrow 
      @click-left="router.back()" 
    />
    
    <van-address-edit
      :area-list="areaData"
      :address-info="addressInfo"
      show-delete
      show-set-default
      show-search-result
      :area-columns-placeholder="['请选择', '请选择', '请选择']"
      @save="onSave"
      @delete="onDelete"
    />
  </div>
</template>

<style scoped>
.address-edit-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}
</style>
