<template>
  <el-menu
    :active-text-color="activeTextColor"
    :background-color="backgroundColor"
    :text-color="textColor"
    :default-active="activeMenu"
    class="sidebar-menu"
    :collapse="isCollapse"
    router
  >
    <sidebar-item
      v-for="route in routes"
      :key="route.path"
      :item="route"
      :base-path="route.path"
    />
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const router = useRouter()

// 这里的样式变量可以以后提取到全局配置
const backgroundColor = '#304156'
const textColor = '#bfcbd9'
const activeTextColor = '#409EFF'
const isCollapse = false // 暂时写死，后续可以放到 Pinia 管理

const routes = computed(() => {
    // 过滤掉 hidden 的路由
    return router.options.routes.filter(r => !r.meta?.hidden)
})

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})
</script>

<style scoped>
.sidebar-menu {
    border-right: none;
    height: 100%;
}
</style>
