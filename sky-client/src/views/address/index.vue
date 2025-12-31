<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { listAddress } from '@/api/address'

const router = useRouter()
const route = useRoute()
const chosenAddressId = ref('')
const list = ref<any[]>([])

// 是否是选择模式
const isSelectMode = route.query.from === 'order'

const fetchList = async () => {
  try {
    const res = await listAddress()
    const data = (res as any) || []
    // 转换成 Vant 需要的格式
    list.value = data.map((item: any) => ({
      id: item.id,
      name: item.consignee,
      tel: item.phone,
      address: `${item.provinceName || ''}${item.cityName || ''}${item.districtName || ''}${item.detail}`,
      isDefault: item.isDefault === 1,
      originalData: item
    }))
  } catch (error) {
    console.error(error)
  }
}

const onAdd = () => {
  router.push('/address/edit')
}

const onEdit = (item: any) => {
  router.push({ path: '/address/edit', query: { id: item.id } })
}

const onSelect = (item: any) => {
  if (isSelectMode) {
    // 选中后返回下单页，携带地址ID
    router.replace({ path: '/order/submit', query: { addressId: item.id } })
  }
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="address-list-container">
    <van-nav-bar 
      :title="isSelectMode ? '选择收货地址' : '地址管理'" 
      left-arrow 
      @click-left="router.back()" 
    />
    
    <van-address-list
      v-model="chosenAddressId"
      :list="list"
      default-tag-text="默认"
      @add="onAdd"
      @edit="onEdit"
      @select="onSelect"
    />
  </div>
</template>

<style scoped>
.address-list-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}
</style>
