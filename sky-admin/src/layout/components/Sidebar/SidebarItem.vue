<template>
  <div v-if="!item.meta?.hidden">
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.meta?.alwaysShow">
      <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown': !isNest}">
        <el-icon v-if="onlyOneChild.meta?.icon || (item.meta && item.meta.icon)">
          <component :is="onlyOneChild.meta?.icon || item.meta?.icon" />
        </el-icon>
              <template #title>
                <span>{{ $t(onlyOneChild.meta?.title as string) }}</span>
              </template>      </el-menu-item>
    </template>

    <el-sub-menu v-else :index="resolvePath(item.path)" popper-append-to-body>
      <template #title>
        <el-icon v-if="item.meta && item.meta.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ $t(item.meta?.title as string) }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(item.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouteRecordRaw } from 'vue-router'

const props = defineProps<{
  item: RouteRecordRaw
  basePath: string
  isNest?: boolean
}>()

const onlyOneChild = ref<any>(null)

const hasOneShowingChild = (children: RouteRecordRaw[] = [], parent: RouteRecordRaw) => {
  const showingChildren = children.filter(item => {
    if (item.meta?.hidden) {
      return false
    } else {
      return true
    }
  })

  if (showingChildren.length === 1) {
    onlyOneChild.value = showingChildren[0]
    return true
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

const resolvePath = (routePath: string) => {
  if (routePath.startsWith('http')) {
      return routePath
  }
  if (routePath.startsWith('/')) {
    return routePath
  }
  // 处理空路径的情况
  if (!routePath) {
      return props.basePath
  }
  if (props.basePath.endsWith('/')) {
      return props.basePath + routePath
  }
  return `${props.basePath}/${routePath}`
}
</script>