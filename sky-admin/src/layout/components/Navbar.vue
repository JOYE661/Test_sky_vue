<template>
  <div class="navbar">
    <!-- 1. 面包屑 -->
    <el-breadcrumb class="breadcrumb-container" separator="/">
      <transition-group name="breadcrumb">
        <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
          <span v-if="index == levelList.length - 1" class="no-redirect">{{ item.meta.title }}</span>
          <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
        </el-breadcrumb-item>
      </transition-group>
    </el-breadcrumb>

    <!-- 2. 营业状态开关 -->
    <div class="status-switch-wrapper">
        <el-switch
            v-model="shopStatus"
            :active-value="1"
            :inactive-value="0"
            active-text="上线"
            inactive-text="下线"
            inline-prompt
            active-color="#13ce66"
            inactive-color="#ff4949"
            :loading="loading"
            @change="handleStatusChange"
        />
    </div>

    <!-- 3. 占位符 (把后面的元素挤到最右边) -->
    <div class="flex-spacer"></div>

    <!-- 4. 用户下拉菜单 -->
    <div class="right-menu">
      <!-- 语言切换 -->
      <div class="lang-select" @click="toggleLanguage" style="cursor: pointer; margin-right: 20px; display: flex; align-items: center;">
          <span style="font-size: 14px; color: #606266;">
              {{ currentLang === 'zh-cn' ? 'English' : '中文' }}
          </span>
      </div>

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <el-avatar :size="30" icon="UserFilled" class="user-avatar" />
          <span class="user-name">{{ userName }}</span>
          <el-icon class="el-icon--right"><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push('/')">{{ $t('route.dashboard') }}</el-dropdown-item>
            <el-dropdown-item @click="handlePassword">{{ $t('navbar.changePassword') }}</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">{{ $t('navbar.logout') }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 弹窗部分 -->
    <el-dialog :title="$t('navbar.changePassword')" v-model="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="passFormRef" :model="passForm" :rules="passRules" label-width="100px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitPassword(passFormRef)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter, type RouteLocationMatched } from 'vue-router'
import { getShopStatus, setShopStatus } from '@/api/shop'
import { useUserStore } from '@/store/modules/user'
import { logout, editPassword } from '@/api/employee'
import { ElMessage, type FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { locale, t } = useI18n()

const currentLang = computed(() => locale.value)

const toggleLanguage = () => {
    locale.value = locale.value === 'zh-cn' ? 'en' : 'zh-cn'
    localStorage.setItem('language', locale.value)
    // 重新生成面包屑，以应用新语言
    getBreadcrumb()
    ElMessage.success('Switch Language Success')
}

const levelList = ref<RouteLocationMatched[]>([])
const shopStatus = ref(1)
const loading = ref(false)
const dialogVisible = ref(false)
const passFormRef = ref<FormInstance>()

const userName = computed(() => {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
        try {
            const userInfo = JSON.parse(userInfoStr)
            return userInfo.name || userInfo.username || '管理员'
        } catch (e) { return '管理员' }
    }
    return '管理员'
})

const passForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const validateConfirm = (_rule: any, value: any, callback: any) => {
    if (value !== passForm.newPassword) {
        callback(new Error('两次输入密码不一致'))
    } else {
        callback()
    }
}

const passRules = {
    oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        { validator: validateConfirm, trigger: 'blur' }
    ]
}

const getBreadcrumb = () => {
  let matched = route.matched.filter(item => item.meta && item.meta.title)
  // 复制一份并翻译 title
  levelList.value = matched.map(item => ({
      ...item,
      meta: { 
          ...item.meta, 
          title: t(item.meta.title as string) 
      }
  }))
}

const handleLink = (item: any) => {
    const { redirect, path } = item
    if (redirect) {
        router.push(redirect)
        return
    }
    router.push(path)
}

const getStatus = async () => {
    try {
        const res: any = await getShopStatus()
        shopStatus.value = res
    } catch (e) {}
}

const handleStatusChange = async (val: any) => {
    loading.value = true
    try {
        await setShopStatus(val)
        ElMessage.success(val === 1 ? '店铺已营业' : '店铺已打烊')
    } catch (e) {
        shopStatus.value = val === 1 ? 0 : 1
    } finally {
        loading.value = false
    }
}

const handlePassword = () => {
    dialogVisible.value = true
}

const handleClose = () => {
    dialogVisible.value = false
    passFormRef.value?.resetFields()
}

const submitPassword = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                await editPassword({ ...passForm })
                ElMessage.success('密码修改成功，请重新登录')
                handleLogout()
            } catch (e) {}
        }
    })
}

const handleLogout = async () => {
    try {
        await logout()
    } catch(e) {}
    userStore.removeToken()
    localStorage.removeItem('userInfo')
    router.push('/login')
}

watch(route, () => {
    getBreadcrumb()
})

onMounted(() => {
    getBreadcrumb()
    getStatus()
})
</script>

<style scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  /* 关键：使用 Flex 布局 */
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.status-switch-wrapper {
    margin-left: 20px; /* 距离左边的面包屑一些距离 */
    display: flex;
    align-items: center;
}

.breadcrumb-container {
    font-size: 14px;
    line-height: 50px;
    /* 不设置 float，不设置宽度 */
}

.no-redirect {
    color: #97a8be;
    cursor: text;
}

/* 占位符：自动占据剩余空间 */
.flex-spacer {
    flex-grow: 1;
}

.right-menu {
    display: flex;
    align-items: center;
}

.avatar-container {
    cursor: pointer;
}
.avatar-wrapper {
    display: flex;
    align-items: center;
}
.user-name {
    margin-left: 8px;
    font-size: 14px;
    color: #333;
}
</style>
